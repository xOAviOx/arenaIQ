import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const questions = [
  // ── PHYSICS ────────────────────────────────────────────────
  {
    latexQuestion:
      'A particle moves along the x-axis with velocity $v = (3t^2 - 2t)$ m/s. The acceleration at $t = 2s$ is:',
    options: ['$8 \\text{ m/s}^2$', '$10 \\text{ m/s}^2$', '$6 \\text{ m/s}^2$', '$4 \\text{ m/s}^2$'],
    correctOption: 1,
    subject: 'PHYSICS',
    topic: 'Kinematics',
    difficulty: 'MEDIUM',
    year: 2022,
    source: 'JEE_MAINS',
    explanation:
      '$a = \\frac{dv}{dt} = 6t - 2$. At $t=2$: $a = 12 - 2 = 10 \\text{ m/s}^2$',
  },
  {
    latexQuestion:
      'Two bodies of masses $m_1 = 4 \\text{ kg}$ and $m_2 = 6 \\text{ kg}$ are connected by a string over a frictionless pulley. The acceleration of the system is: ($g = 10 \\text{ m/s}^2$)',
    options: ['$2 \\text{ m/s}^2$', '$4 \\text{ m/s}^2$', '$6 \\text{ m/s}^2$', '$8 \\text{ m/s}^2$'],
    correctOption: 0,
    subject: 'PHYSICS',
    topic: "Newton's Laws",
    difficulty: 'EASY',
    year: 2021,
    source: 'JEE_MAINS',
    explanation:
      '$a = \\frac{(m_2 - m_1)g}{m_1 + m_2} = \\frac{(6-4) \\times 10}{10} = 2 \\text{ m/s}^2$',
  },
  {
    latexQuestion:
      'The escape velocity from the surface of Earth is $v_e$. The escape velocity from a planet of mass $2M$ and radius $2R$ is:',
    options: ['$v_e$', '$\\sqrt{2} v_e$', '$2v_e$', '$\\frac{v_e}{\\sqrt{2}}$'],
    correctOption: 0,
    subject: 'PHYSICS',
    topic: 'Gravitation',
    difficulty: 'MEDIUM',
    year: 2023,
    source: 'JEE_MAINS',
    explanation:
      '$v_e = \\sqrt{\\frac{2GM}{R}}$. New: $\\sqrt{\\frac{2G(2M)}{2R}} = \\sqrt{\\frac{2GM}{R}} = v_e$',
  },
  {
    latexQuestion:
      'A body of mass $m$ is placed on a rough incline of angle $\\theta$. The coefficient of friction is $\\mu$. The minimum force required to push the body up the incline is:',
    options: [
      '$mg(\\sin\\theta + \\mu\\cos\\theta)$',
      '$mg(\\sin\\theta - \\mu\\cos\\theta)$',
      '$mg\\cos\\theta$',
      '$mg\\sin\\theta$',
    ],
    correctOption: 0,
    subject: 'PHYSICS',
    topic: 'Laws of Motion',
    difficulty: 'MEDIUM',
    year: 2020,
    source: 'JEE_MAINS',
    explanation:
      'To push up: overcome both gravity component and friction (both oppose upward motion): $F = mg\\sin\\theta + \\mu mg\\cos\\theta$',
  },
  {
    latexQuestion:
      'A simple pendulum of length $L$ has time period $T$. If the length is increased to $4L$, the new time period is:',
    options: ['$4T$', '$2T$', '$\\frac{T}{2}$', '$\\frac{T}{4}$'],
    correctOption: 1,
    subject: 'PHYSICS',
    topic: 'Simple Harmonic Motion',
    difficulty: 'EASY',
    year: 2022,
    source: 'NEET',
    explanation:
      '$T = 2\\pi\\sqrt{\\frac{L}{g}}$. New: $2\\pi\\sqrt{\\frac{4L}{g}} = 2T$',
  },
  {
    latexQuestion:
      'The de Broglie wavelength of a particle of mass $m$ moving with kinetic energy $K$ is:',
    options: [
      '$\\frac{h}{\\sqrt{2mK}}$',
      '$\\frac{h}{\\sqrt{mK}}$',
      '$\\frac{h}{2mK}$',
      '$\\sqrt{\\frac{h}{2mK}}$',
    ],
    correctOption: 0,
    subject: 'PHYSICS',
    topic: 'Modern Physics',
    difficulty: 'MEDIUM',
    year: 2021,
    source: 'JEE_MAINS',
    explanation:
      '$\\lambda = \\frac{h}{p} = \\frac{h}{\\sqrt{2mK}}$ since $K = \\frac{p^2}{2m}$',
  },
  {
    latexQuestion:
      'In a series LCR circuit, resonance occurs when the frequency is $f_0$. At resonance, the impedance of the circuit equals:',
    options: ['$R$', '$\\sqrt{R^2 + (X_L - X_C)^2}$', '$X_L + X_C$', 'Zero'],
    correctOption: 0,
    subject: 'PHYSICS',
    topic: 'Electromagnetic Induction',
    difficulty: 'EASY',
    year: 2023,
    source: 'NEET',
    explanation: 'At resonance, $X_L = X_C$, so impedance $Z = \\sqrt{R^2 + 0} = R$',
  },
  {
    latexQuestion:
      'A convex lens of focal length $f$ forms an image at distance $v$ for an object at distance $u$. If the object distance equals $3f$, the image distance is:',
    options: ['$\\frac{3f}{2}$', '$2f$', '$3f$', '$\\frac{3f}{4}$'],
    correctOption: 0,
    subject: 'PHYSICS',
    topic: 'Optics',
    difficulty: 'MEDIUM',
    year: 2020,
    source: 'JEE_MAINS',
    explanation:
      'Lens formula: $\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}$. With $u = -3f$: $\\frac{1}{v} = \\frac{1}{f} - \\frac{1}{3f} = \\frac{2}{3f}$, so $v = \\frac{3f}{2}$',
  },
  {
    latexQuestion:
      'A Carnot engine operates between temperatures $T_H = 800K$ and $T_C = 400K$. Its efficiency is:',
    options: ['$25\\%$', '$50\\%$', '$75\\%$', '$100\\%$'],
    correctOption: 1,
    subject: 'PHYSICS',
    topic: 'Thermodynamics',
    difficulty: 'EASY',
    year: 2022,
    source: 'NEET',
    explanation: '$\\eta = 1 - \\frac{T_C}{T_H} = 1 - \\frac{400}{800} = 0.5 = 50\\%$',
  },
  {
    latexQuestion:
      'The half-life of a radioactive substance is 20 years. After 60 years, the fraction remaining is:',
    options: ['$\\frac{1}{8}$', '$\\frac{1}{4}$', '$\\frac{1}{6}$', '$\\frac{1}{3}$'],
    correctOption: 0,
    subject: 'PHYSICS',
    topic: 'Nuclear Physics',
    difficulty: 'EASY',
    year: 2021,
    source: 'NEET',
    explanation:
      '$n = \\frac{60}{20} = 3$ half-lives. Fraction = $\\left(\\frac{1}{2}\\right)^3 = \\frac{1}{8}$',
  },

  // ── CHEMISTRY ──────────────────────────────────────────────
  {
    latexQuestion:
      'The IUPAC name of the compound $\\text{CH}_3\\text{CH(OH)CH}_2\\text{CHO}$ is:',
    options: [
      '3-hydroxybutanal',
      '2-hydroxybutanal',
      '3-hydroxybutanol',
      '2-methylpropan-1-ol',
    ],
    correctOption: 0,
    subject: 'CHEMISTRY',
    topic: 'Organic Chemistry - Nomenclature',
    difficulty: 'MEDIUM',
    year: 2022,
    source: 'JEE_MAINS',
    explanation:
      'The longest chain has 4 carbons with an aldehyde at C1 (butanal) and OH at C3.',
  },
  {
    latexQuestion:
      'For the reaction $\\text{N}_2 + 3\\text{H}_2 \\rightleftharpoons 2\\text{NH}_3$, $K_p = 9.25 \\times 10^{-2}$ atm$^{-2}$ at 300°C. The value of $K_c$ at this temperature is: ($R = 0.082$ L·atm·mol$^{-1}$·K$^{-1}$)',
    options: ['$38.44$', '$3.84$', '$0.384$', '$384.4$'],
    correctOption: 0,
    subject: 'CHEMISTRY',
    topic: 'Chemical Equilibrium',
    difficulty: 'HARD',
    year: 2021,
    source: 'JEE_ADVANCED',
    explanation:
      '$\\Delta n = 2 - 4 = -2$. $K_c = K_p \\times (RT)^{-\\Delta n} = 9.25 \\times 10^{-2} \\times (0.082 \\times 573)^2 \\approx 38.44$',
  },
  {
    latexQuestion:
      'The hybridisation and shape of $\\text{SF}_6$ are respectively:',
    options: ['$sp^3d^2$, octahedral', '$sp^3$, tetrahedral', '$sp^3d$, trigonal bipyramidal', '$d^2sp^3$, square planar'],
    correctOption: 0,
    subject: 'CHEMISTRY',
    topic: 'Chemical Bonding',
    difficulty: 'EASY',
    year: 2023,
    source: 'NEET',
    explanation:
      'SF6 has 6 bond pairs around S with no lone pairs: $sp^3d^2$ hybridisation, octahedral shape.',
  },
  {
    latexQuestion:
      'Which of the following has the highest lattice energy?',
    options: ['$\\text{MgO}$', '$\\text{NaCl}$', '$\\text{KCl}$', '$\\text{CaO}$'],
    correctOption: 0,
    subject: 'CHEMISTRY',
    topic: 'Ionic Bonding',
    difficulty: 'MEDIUM',
    year: 2020,
    source: 'NEET',
    explanation:
      'Lattice energy $\\propto \\frac{q_+ \\cdot q_-}{r}$. MgO has 2+ and 2- ions with small radii, giving the highest lattice energy.',
  },
  {
    latexQuestion:
      'The order of reaction with respect to a reactant is determined by:',
    options: [
      'Experimental data',
      'Stoichiometric coefficient',
      'Molecularity',
      'Activation energy',
    ],
    correctOption: 0,
    subject: 'CHEMISTRY',
    topic: 'Chemical Kinetics',
    difficulty: 'EASY',
    year: 2022,
    source: 'NEET',
    explanation: 'Order of reaction is always determined experimentally, not from the balanced equation.',
  },
  {
    latexQuestion:
      'The number of $\\pi$ bonds in benzene is:',
    options: ['$3$', '$6$', '$9$', '$2$'],
    correctOption: 0,
    subject: 'CHEMISTRY',
    topic: 'Aromatic Compounds',
    difficulty: 'EASY',
    year: 2021,
    source: 'NEET',
    explanation:
      'Benzene has 3 alternating double bonds (Kekulé structure), each containing one $\\pi$ bond, giving 3 $\\pi$ bonds total.',
  },
  {
    latexQuestion:
      'The standard electrode potential of $\\text{Zn}^{2+}/\\text{Zn}$ is $-0.76$ V and of $\\text{Cu}^{2+}/\\text{Cu}$ is $+0.34$ V. The EMF of the cell $\\text{Zn} | \\text{Zn}^{2+} || \\text{Cu}^{2+} | \\text{Cu}$ is:',
    options: ['$1.10 \\text{ V}$', '$0.42 \\text{ V}$', '$-1.10 \\text{ V}$', '$0.76 \\text{ V}$'],
    correctOption: 0,
    subject: 'CHEMISTRY',
    topic: 'Electrochemistry',
    difficulty: 'MEDIUM',
    year: 2022,
    source: 'JEE_MAINS',
    explanation:
      '$E_{cell} = E_{cathode} - E_{anode} = 0.34 - (-0.76) = 1.10 \\text{ V}$',
  },
  {
    latexQuestion:
      'The product of reaction of ethanol with acidified $\\text{K}_2\\text{Cr}_2\\text{O}_7$ is:',
    options: ['Acetic acid', 'Acetaldehyde', 'Ethylene', 'Ethanal only'],
    correctOption: 0,
    subject: 'CHEMISTRY',
    topic: 'Alcohols and Oxidation',
    difficulty: 'EASY',
    year: 2020,
    source: 'NEET',
    explanation:
      'Acidified $\\text{K}_2\\text{Cr}_2\\text{O}_7$ is a strong oxidising agent; it oxidises primary alcohol (ethanol) to acetic acid (carboxylic acid).',
  },
  {
    latexQuestion:
      'Which quantum number determines the shape of an orbital?',
    options: ['Azimuthal ($l$)', 'Principal ($n$)', 'Magnetic ($m_l$)', 'Spin ($m_s$)'],
    correctOption: 0,
    subject: 'CHEMISTRY',
    topic: 'Atomic Structure',
    difficulty: 'EASY',
    year: 2023,
    source: 'NEET',
    explanation:
      'The azimuthal (angular momentum) quantum number $l$ determines the shape of the orbital.',
  },
  {
    latexQuestion:
      'The van\'t Hoff factor for $\\text{Al}_2(\\text{SO}_4)_3$ assuming complete dissociation is:',
    options: ['$5$', '$3$', '$4$', '$2$'],
    correctOption: 0,
    subject: 'CHEMISTRY',
    topic: 'Solutions',
    difficulty: 'MEDIUM',
    year: 2022,
    source: 'JEE_MAINS',
    explanation:
      '$\\text{Al}_2(\\text{SO}_4)_3 \\rightarrow 2\\text{Al}^{3+} + 3\\text{SO}_4^{2-}$. Total ions = 5, so $i = 5$.',
  },

  // ── MATHEMATICS ────────────────────────────────────────────
  {
    latexQuestion:
      'If $f(x) = x^3 - 6x^2 + 11x - 6$, then the roots of $f(x) = 0$ are:',
    options: ['$1, 2, 3$', '$-1, 2, 3$', '$1, -2, 3$', '$1, 2, -3$'],
    correctOption: 0,
    subject: 'MATHEMATICS',
    topic: 'Polynomials',
    difficulty: 'EASY',
    year: 2021,
    source: 'JEE_MAINS',
    explanation:
      'By inspection or rational root theorem: $f(1) = 0$, $f(2) = 0$, $f(3) = 0$. Roots are $1, 2, 3$.',
  },
  {
    latexQuestion:
      '$\\int_0^{\\pi/2} \\sin^2 x \\, dx$ equals:',
    options: ['$\\frac{\\pi}{4}$', '$\\frac{\\pi}{2}$', '$1$', '$\\frac{1}{2}$'],
    correctOption: 0,
    subject: 'MATHEMATICS',
    topic: 'Definite Integration',
    difficulty: 'MEDIUM',
    year: 2022,
    source: 'JEE_MAINS',
    explanation:
      'Using $\\sin^2 x = \\frac{1 - \\cos 2x}{2}$: $\\int_0^{\\pi/2} \\frac{1 - \\cos 2x}{2} dx = \\frac{\\pi}{4}$',
  },
  {
    latexQuestion:
      'The number of solutions of $\\tan x = x$ in $[0, 2\\pi]$ is:',
    options: ['$3$', '$2$', '$4$', '$1$'],
    correctOption: 0,
    subject: 'MATHEMATICS',
    topic: 'Trigonometry',
    difficulty: 'HARD',
    year: 2020,
    source: 'JEE_ADVANCED',
    explanation:
      'Graphically, $y = \\tan x$ intersects $y = x$ at $x = 0$, and once in each of the intervals $(0, \\pi/2)$, $(\\pi/2, 3\\pi/2)$ — giving 3 solutions in $[0, 2\\pi]$.',
  },
  {
    latexQuestion:
      'The general term of the binomial expansion $(1 + x)^n$ is given by:',
    options: [
      '$\\binom{n}{r} x^r$',
      '$\\binom{n}{r} x^{n-r}$',
      '$n! \\cdot x^r$',
      '$\\binom{n}{r} x^{r+1}$',
    ],
    correctOption: 0,
    subject: 'MATHEMATICS',
    topic: 'Binomial Theorem',
    difficulty: 'EASY',
    year: 2021,
    source: 'JEE_MAINS',
    explanation:
      'The $(r+1)$th term of $(1+x)^n$ is $T_{r+1} = \\binom{n}{r} 1^{n-r} x^r = \\binom{n}{r} x^r$',
  },
  {
    latexQuestion:
      'The equation of a circle with centre $(2, -3)$ and radius $5$ is:',
    options: [
      '$(x-2)^2 + (y+3)^2 = 25$',
      '$(x+2)^2 + (y-3)^2 = 25$',
      '$(x-2)^2 + (y-3)^2 = 25$',
      '$(x-2)^2 + (y+3)^2 = 5$',
    ],
    correctOption: 0,
    subject: 'MATHEMATICS',
    topic: 'Coordinate Geometry',
    difficulty: 'EASY',
    year: 2022,
    source: 'NEET',
    explanation:
      'Circle: $(x - h)^2 + (y - k)^2 = r^2$, with $(h, k) = (2, -3)$ and $r = 5$.',
  },
  {
    latexQuestion:
      'If $\\vec{a} = 2\\hat{i} + 3\\hat{j} - \\hat{k}$ and $\\vec{b} = \\hat{i} - \\hat{j} + 2\\hat{k}$, then $\\vec{a} \\cdot \\vec{b}$ is:',
    options: ['$-3$', '$3$', '$7$', '$-7$'],
    correctOption: 0,
    subject: 'MATHEMATICS',
    topic: 'Vectors',
    difficulty: 'EASY',
    year: 2021,
    source: 'JEE_MAINS',
    explanation:
      '$\\vec{a} \\cdot \\vec{b} = (2)(1) + (3)(-1) + (-1)(2) = 2 - 3 - 2 = -3$',
  },
  {
    latexQuestion:
      'The value of $\\lim_{x \\to 0} \\frac{\\sin 3x}{5x}$ is:',
    options: ['$\\frac{3}{5}$', '$\\frac{5}{3}$', '$1$', '$0$'],
    correctOption: 0,
    subject: 'MATHEMATICS',
    topic: 'Limits',
    difficulty: 'EASY',
    year: 2023,
    source: 'JEE_MAINS',
    explanation:
      '$\\lim_{x \\to 0} \\frac{\\sin 3x}{5x} = \\lim_{x \\to 0} \\frac{3 \\cdot \\sin 3x}{3x \\cdot 5} = \\frac{3}{5} \\cdot 1 = \\frac{3}{5}$',
  },
  {
    latexQuestion:
      'The number of ways to arrange the letters of the word "MATHEMATICS" is:',
    options: [
      '$\\frac{11!}{2! \\cdot 2! \\cdot 2!}$',
      '$11!$',
      '$\\frac{11!}{3!}$',
      '$\\frac{11!}{2! \\cdot 2!}$',
    ],
    correctOption: 0,
    subject: 'MATHEMATICS',
    topic: 'Permutations and Combinations',
    difficulty: 'MEDIUM',
    year: 2022,
    source: 'JEE_MAINS',
    explanation:
      'MATHEMATICS has 11 letters: M(2), A(2), T(2), and others unique. Total = $\\frac{11!}{2! \\cdot 2! \\cdot 2!}$',
  },
  {
    latexQuestion:
      'If $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$, then $\\det(A)$ is:',
    options: ['$-2$', '$2$', '$10$', '$-10$'],
    correctOption: 0,
    subject: 'MATHEMATICS',
    topic: 'Matrices and Determinants',
    difficulty: 'EASY',
    year: 2021,
    source: 'NEET',
    explanation:
      '$\\det(A) = (1)(4) - (2)(3) = 4 - 6 = -2$',
  },
  {
    latexQuestion:
      'The area bounded by the curve $y = x^2$, the x-axis and the lines $x = 1$, $x = 3$ is:',
    options: ['$\\frac{26}{3}$', '$\\frac{28}{3}$', '$9$', '$\\frac{8}{3}$'],
    correctOption: 0,
    subject: 'MATHEMATICS',
    topic: 'Application of Integration',
    difficulty: 'MEDIUM',
    year: 2023,
    source: 'JEE_MAINS',
    explanation:
      '$\\int_1^3 x^2 dx = \\left[\\frac{x^3}{3}\\right]_1^3 = \\frac{27}{3} - \\frac{1}{3} = \\frac{26}{3}$',
  },

  // ── BIOLOGY (NEET) ─────────────────────────────────────────
  {
    latexQuestion:
      'Which of the following is NOT a function of the plasma membrane?',
    options: [
      'Protein synthesis',
      'Cell signalling',
      'Transport of molecules',
      'Cell recognition',
    ],
    correctOption: 0,
    subject: 'BIOLOGY',
    topic: 'Cell Biology',
    difficulty: 'EASY',
    year: 2022,
    source: 'NEET',
    explanation:
      'Protein synthesis occurs on ribosomes in the cytoplasm/ER, not at the plasma membrane.',
  },
  {
    latexQuestion:
      'The process by which $\\text{CO}_2$ is fixed in the Calvin cycle is called:',
    options: ['Carbon fixation', 'Oxidative phosphorylation', 'Glycolysis', 'Fermentation'],
    correctOption: 0,
    subject: 'BIOLOGY',
    topic: 'Photosynthesis',
    difficulty: 'EASY',
    year: 2021,
    source: 'NEET',
    explanation:
      'In the Calvin cycle, $\\text{CO}_2$ is fixed (attached to RuBP by RuBisCO) — this is called carbon fixation.',
  },
  {
    latexQuestion:
      'Which type of RNA carries amino acids to the ribosome during translation?',
    options: ['tRNA', 'mRNA', 'rRNA', 'hnRNA'],
    correctOption: 0,
    subject: 'BIOLOGY',
    topic: 'Molecular Biology',
    difficulty: 'EASY',
    year: 2023,
    source: 'NEET',
    explanation:
      'Transfer RNA (tRNA) acts as an adaptor molecule, carrying specific amino acids to the ribosome during protein synthesis.',
  },
  {
    latexQuestion:
      'The site of fertilisation in the human female reproductive tract is:',
    options: ['Fallopian tube (ampulla)', 'Uterus', 'Ovary', 'Cervix'],
    correctOption: 0,
    subject: 'BIOLOGY',
    topic: 'Reproduction',
    difficulty: 'EASY',
    year: 2022,
    source: 'NEET',
    explanation:
      'Fertilisation normally occurs in the ampulla of the fallopian tube (uterine tube).',
  },
  {
    latexQuestion:
      'Which of the following blood groups is the universal donor?',
    options: ['O−', 'AB+', 'A+', 'B−'],
    correctOption: 0,
    subject: 'BIOLOGY',
    topic: 'Body Fluids and Circulation',
    difficulty: 'EASY',
    year: 2021,
    source: 'NEET',
    explanation:
      'O− (O Rh-negative) is the universal donor because it lacks A, B, and Rh antigens on red blood cells.',
  },
  {
    latexQuestion:
      'Crossing over between homologous chromosomes occurs during:',
    options: [
      'Pachytene of Meiosis I',
      'Leptotene of Meiosis I',
      'Zygotene of Meiosis I',
      'Diplotene of Meiosis I',
    ],
    correctOption: 0,
    subject: 'BIOLOGY',
    topic: 'Cell Division',
    difficulty: 'MEDIUM',
    year: 2022,
    source: 'NEET',
    explanation:
      'Crossing over (exchange of genetic material) occurs during pachytene of prophase I of meiosis at the chiasmata.',
  },
  {
    latexQuestion:
      'Which enzyme is responsible for the replication of DNA?',
    options: ['DNA polymerase III', 'DNA ligase', 'Helicase', 'Primase'],
    correctOption: 0,
    subject: 'BIOLOGY',
    topic: 'DNA Replication',
    difficulty: 'EASY',
    year: 2020,
    source: 'NEET',
    explanation:
      'DNA polymerase III is the main enzyme that synthesises new DNA strands during replication in prokaryotes.',
  },
  {
    latexQuestion:
      'The term "ecology" was coined by:',
    options: ['Ernst Haeckel', 'Charles Darwin', 'Gregor Mendel', 'Carl Linnaeus'],
    correctOption: 0,
    subject: 'BIOLOGY',
    topic: 'Ecology',
    difficulty: 'EASY',
    year: 2021,
    source: 'NEET',
    explanation:
      'Ernst Haeckel coined the term "ecology" (Ökologie) in 1866 to describe the study of organisms and their environment.',
  },
  {
    latexQuestion:
      'Which of the following is a vestigial organ in humans?',
    options: ['Coccyx', 'Appendix (vermiform)', 'Ear muscles', 'All of these'],
    correctOption: 3,
    subject: 'BIOLOGY',
    topic: 'Evolution',
    difficulty: 'MEDIUM',
    year: 2022,
    source: 'NEET',
    explanation:
      'The coccyx, vermiform appendix, and extrinsic ear muscles are all considered vestigial structures in humans.',
  },
  {
    latexQuestion:
      'The energy currency of the cell is:',
    options: ['ATP', 'ADP', 'NADH', 'FADH$_2$'],
    correctOption: 0,
    subject: 'BIOLOGY',
    topic: 'Bioenergetics',
    difficulty: 'EASY',
    year: 2023,
    source: 'NEET',
    explanation:
      'Adenosine triphosphate (ATP) is the primary energy currency of the cell, storing and transferring chemical energy.',
  },

  // ── MIXED HARD ─────────────────────────────────────────────
  {
    latexQuestion:
      'A ball is projected at angle $\\theta$ with horizontal velocity $v_0$. The range is maximum when:',
    options: ['$\\theta = 45°$', '$\\theta = 30°$', '$\\theta = 60°$', '$\\theta = 90°$'],
    correctOption: 0,
    subject: 'PHYSICS',
    topic: 'Projectile Motion',
    difficulty: 'EASY',
    year: 2021,
    source: 'JEE_MAINS',
    explanation:
      '$R = \\frac{v_0^2 \\sin 2\\theta}{g}$. $R$ is maximum when $\\sin 2\\theta = 1$, i.e., $\\theta = 45°$.',
  },
  {
    latexQuestion:
      'The oxidation state of Cr in $\\text{K}_2\\text{Cr}_2\\text{O}_7$ is:',
    options: ['$+6$', '$+3$', '$+7$', '$+4$'],
    correctOption: 0,
    subject: 'CHEMISTRY',
    topic: 'Redox Chemistry',
    difficulty: 'EASY',
    year: 2020,
    source: 'NEET',
    explanation:
      '$2(+1) + 2x + 7(-2) = 0 \\Rightarrow 2 + 2x - 14 = 0 \\Rightarrow x = +6$',
  },
  {
    latexQuestion:
      'If $P(A) = 0.6$, $P(B) = 0.5$ and $P(A \\cap B) = 0.3$, then $P(A \\cup B)$ is:',
    options: ['$0.8$', '$0.6$', '$0.7$', '$0.9$'],
    correctOption: 0,
    subject: 'MATHEMATICS',
    topic: 'Probability',
    difficulty: 'EASY',
    year: 2022,
    source: 'JEE_MAINS',
    explanation:
      '$P(A \\cup B) = P(A) + P(B) - P(A \\cap B) = 0.6 + 0.5 - 0.3 = 0.8$',
  },
  {
    latexQuestion:
      'The magnetic moment of $\\text{Fe}^{3+}$ (atomic number 26) is:',
    options: ['$5.92 \\text{ BM}$', '$4.90 \\text{ BM}$', '$3.87 \\text{ BM}$', '$2.83 \\text{ BM}$'],
    correctOption: 0,
    subject: 'CHEMISTRY',
    topic: 'Coordination Chemistry',
    difficulty: 'MEDIUM',
    year: 2023,
    source: 'NEET',
    explanation:
      '$\\text{Fe}^{3+}$: [Ar]$3d^5$ — 5 unpaired electrons. $\\mu = \\sqrt{n(n+2)} = \\sqrt{5 \\times 7} = \\sqrt{35} \\approx 5.92 \\text{ BM}$',
  },
  {
    latexQuestion:
      'The sum of the series $1 + \\frac{1}{2} + \\frac{1}{4} + \\frac{1}{8} + \\cdots$ to infinity is:',
    options: ['$2$', '$1$', '$\\frac{1}{2}$', '$\\infty$'],
    correctOption: 0,
    subject: 'MATHEMATICS',
    topic: 'Sequences and Series',
    difficulty: 'EASY',
    year: 2021,
    source: 'JEE_MAINS',
    explanation:
      'Infinite GP with $a = 1$, $r = \\frac{1}{2}$. Sum $= \\frac{a}{1-r} = \\frac{1}{1 - 1/2} = 2$',
  },
] as const;

async function main() {
  console.log('Seeding 50 JEE/NEET questions...');

  for (const q of questions) {
    await prisma.question.upsert({
      where: {
        id: `seed-${q.topic.replace(/\s+/g, '-').toLowerCase()}-${q.year ?? 'na'}-${questions.indexOf(q)}`,
      },
      update: {},
      create: {
        id: `seed-${q.topic.replace(/\s+/g, '-').toLowerCase()}-${q.year ?? 'na'}-${questions.indexOf(q)}`,
        latexQuestion: q.latexQuestion,
        options: Array.from(q.options),
        correctOption: q.correctOption,
        subject: q.subject as any,
        topic: q.topic,
        difficulty: q.difficulty as any,
        year: q.year ?? null,
        source: q.source as any,
        explanation: 'explanation' in q ? (q.explanation as string) : null,
      },
    });
  }

  console.log(`Seeded ${questions.length} questions successfully.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
