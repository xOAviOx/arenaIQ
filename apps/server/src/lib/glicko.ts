// Glicko-2 rating calculation
// Scores: 1 = win, 0.5 = draw, 0 = loss

interface PlayerRating {
  rating: number;
  rd: number;       // rating deviation
  vol: number;      // volatility
}

interface GlickoResult {
  newRating: number;
  newRd: number;
  newVol: number;
  delta: number;
}

const TAU = 0.5; // system constant (constrains volatility changes)
const EPSILON = 0.000001;
const SCALE = 173.7178; // converts Glicko-2 scale to Glicko-1 scale

function toGlicko2Scale(r: number, rd: number) {
  return { mu: (r - 1500) / SCALE, phi: rd / SCALE };
}

function g(phi: number): number {
  return 1 / Math.sqrt(1 + (3 * phi * phi) / (Math.PI * Math.PI));
}

function E(mu: number, muJ: number, phiJ: number): number {
  return 1 / (1 + Math.exp(-g(phiJ) * (mu - muJ)));
}

export function calculateGlicko2(
  player: PlayerRating,
  opponent: PlayerRating,
  score: 0 | 0.5 | 1,
): GlickoResult {
  const { mu, phi } = toGlicko2Scale(player.rating, player.rd);
  const { mu: muJ, phi: phiJ } = toGlicko2Scale(opponent.rating, opponent.rd);
  const sigma = player.vol;

  const gPhiJ = g(phiJ);
  const eVal = E(mu, muJ, phiJ);

  const v = 1 / (gPhiJ * gPhiJ * eVal * (1 - eVal));
  const delta = v * gPhiJ * (score - eVal);

  // Compute new volatility via Illinois algorithm
  const a = Math.log(sigma * sigma);
  const f = (x: number) => {
    const ex = Math.exp(x);
    const d2 = phi * phi + v + ex;
    return (
      (ex * (delta * delta - d2)) / (2 * d2 * d2) -
      (x - a) / (TAU * TAU)
    );
  };

  let A = a;
  let B: number;
  if (delta * delta > phi * phi + v) {
    B = Math.log(delta * delta - phi * phi - v);
  } else {
    let k = 1;
    while (f(a - k * TAU) < 0) k++;
    B = a - k * TAU;
  }

  let fA = f(A);
  let fB = f(B);
  while (Math.abs(B - A) > EPSILON) {
    const C = A + ((A - B) * fA) / (fB - fA);
    const fC = f(C);
    if (fC * fB <= 0) {
      A = B;
      fA = fB;
    } else {
      fA /= 2;
    }
    B = C;
    fB = fC;
  }

  const newSigma = Math.exp(A / 2);
  const phiStar = Math.sqrt(phi * phi + newSigma * newSigma);
  const newPhi = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
  const newMu = mu + newPhi * newPhi * gPhiJ * (score - eVal);

  const newRating = Math.round(SCALE * newMu + 1500);
  const newRd = Math.min(Math.round(SCALE * newPhi), 350);

  return {
    newRating,
    newRd,
    newVol: newSigma,
    delta: newRating - player.rating,
  };
}
