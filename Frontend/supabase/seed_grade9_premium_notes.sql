-- ============================================
-- Grade 9 Premium Notes - Original Content
-- Based on UK GCSE Curriculum Specifications
-- ============================================
-- These are original educational notes created based on publicly available
-- curriculum specifications (AQA, Edexcel, OCR GCSE standards)
-- ============================================

TRUNCATE TABLE public.global_premium_notes;

INSERT INTO public.global_premium_notes (title, content, subject, topic, grade_level, tags)
VALUES

-- =====================
-- MATHEMATICS (10 notes)
-- =====================

('Standard Form and Scientific Notation', 
'# Standard Form and Scientific Notation

Standard form is a way of writing very large or very small numbers using powers of 10.

## Format
A number in standard form is written as: **a × 10ⁿ**
- Where **1 ≤ a < 10** (a is between 1 and 10, not including 10)
- **n** is an integer (positive or negative)

## Examples
- 3,400,000 = **3.4 × 10⁶**
- 0.000045 = **4.5 × 10⁻⁵**
- 7,200 = **7.2 × 10³**

## Converting to Standard Form
1. Move the decimal point so there is one non-zero digit before it
2. Count how many places you moved the decimal point
3. This number becomes the power of 10
4. If you moved left, the power is positive; if right, it is negative

## Adding/Subtracting
Convert to the same power of 10, then add/subtract the coefficients.

## Multiplying/Dividing
Multiply/divide the coefficients and add/subtract the powers of 10.',
'Mathematics', 'Number', '9', ARRAY['standard form', 'scientific notation', 'powers of 10']),

('Expanding and Factorising Algebraic Expressions', 
'# Expanding and Factorising Algebraic Expressions

## Expanding Brackets

Expanding means multiplying out brackets to remove them.

### Single Brackets
**a(b + c) = ab + ac**

Examples:
- 3(x + 4) = 3x + 12
- -2(5 - y) = -10 + 2y

### Double Brackets (FOIL Method)
**(a + b)(c + d) = ac + ad + bc + bd**

First, Outside, Inside, Last

Example:
(x + 3)(x + 5) = x² + 5x + 3x + 15 = x² + 8x + 15

### Difference of Two Squares
**(a + b)(a - b) = a² - b²**

Example:
(x + 4)(x - 4) = x² - 16

## Factorising

Factorising is the reverse of expanding - putting brackets back in.

### Common Factor
Find the highest common factor (HCF) of all terms.

Example:
6x + 9 = 3(2x + 3)

### Quadratic Expressions
For x² + bx + c, find two numbers that:
- Multiply to give **c**
- Add to give **b**

Example:
x² + 7x + 12 = (x + 3)(x + 4)',
'Mathematics', 'Algebra', '9', ARRAY['expanding', 'factorising', 'brackets', 'algebra']),

('Solving Linear Equations and Inequalities', 
'# Solving Linear Equations and Inequalities

## Linear Equations

A linear equation has the form: **ax + b = c**

### Steps to Solve
1. **Simplify** both sides (expand brackets, collect like terms)
2. **Move** variable terms to one side, numbers to the other
3. **Divide** by the coefficient of x

### Example
Solve: 3x + 7 = 2x - 5
- Subtract 2x: x + 7 = -5
- Subtract 7: x = -12

### Equations with Fractions
Multiply both sides by the lowest common denominator.

Example:
(x/3) + 2 = 5
- Multiply by 3: x + 6 = 15
- Subtract 6: x = 9

## Inequalities

Inequalities use <, >, ≤, ≥ instead of =.

### Rules
- Adding/subtracting: same as equations
- **Multiplying/dividing by negative number: flip the inequality sign**

### Example
Solve: -2x > 8
- Divide by -2 (flip sign): x < -4

### Representing on Number Line
- < or >: open circle
- ≤ or ≥: closed circle',
'Mathematics', 'Algebra', '9', ARRAY['equations', 'inequalities', 'solving', 'linear']),

('Quadratic Equations and Graphs', 
'# Quadratic Equations and Graphs

## Quadratic Equations

A quadratic equation has the form: **ax² + bx + c = 0**

### Methods to Solve

#### 1. Factorising
If the quadratic factorises, set each bracket equal to zero.

Example:
x² - 5x + 6 = 0
(x - 2)(x - 3) = 0
x = 2 or x = 3

#### 2. Quadratic Formula
When factorising is difficult, use:
**x = (-b ± √(b² - 4ac)) / 2a**

The **discriminant** (b² - 4ac) tells us:
- **Positive**: 2 real solutions
- **Zero**: 1 real solution (repeated root)
- **Negative**: No real solutions

## Quadratic Graphs

The graph of y = ax² + bx + c is a **parabola**.

### Key Features
- **Shape**: U-shaped (a > 0) or ∩-shaped (a < 0)
- **Axis of Symmetry**: x = -b/2a
- **Vertex**: The turning point (minimum or maximum)
- **y-intercept**: (0, c)
- **x-intercepts**: Solutions to ax² + bx + c = 0

### Sketching
1. Find the vertex
2. Find y-intercept
3. Find x-intercepts (if they exist)
4. Plot and draw smooth curve',
'Mathematics', 'Algebra', '9', ARRAY['quadratic', 'parabola', 'graph', 'factorising']),

('Trigonometry Basics', 
'# Trigonometry Basics

Trigonometry deals with relationships between angles and sides in right-angled triangles.

## SOH CAH TOA

### Definitions
- **Sin θ = Opposite / Hypotenuse**
- **Cos θ = Adjacent / Hypotenuse**
- **Tan θ = Opposite / Adjacent**

### Finding Missing Sides
1. Identify which sides you have (opposite, adjacent, hypotenuse)
2. Choose the correct ratio
3. Substitute known values
4. Solve for the unknown

### Finding Missing Angles
1. Use inverse functions: sin⁻¹, cos⁻¹, tan⁻¹
2. Calculate the ratio
3. Use calculator to find angle

## Special Angles

Memorise these exact values:
- **sin 30° = 1/2**, cos 30° = √3/2
- **sin 45° = √2/2**, cos 45° = √2/2
- **sin 60° = √3/2**, cos 60° = 1/2

## Applications
- Finding heights of buildings
- Navigation
- Engineering calculations',
'Mathematics', 'Geometry', '9', ARRAY['trigonometry', 'SOH CAH TOA', 'angles', 'triangles']),

('Probability and Statistics', 
'# Probability and Statistics

## Probability

Probability measures how likely an event is to occur.

### Basic Rules
- **P(event) = Number of favorable outcomes / Total outcomes**
- Probability ranges from 0 (impossible) to 1 (certain)

### Combined Events

#### AND (Multiply)
P(A and B) = P(A) × P(B) - if events are independent

#### OR (Add)
P(A or B) = P(A) + P(B) - if events are mutually exclusive

### Tree Diagrams
Useful for showing all possible outcomes of combined events.

## Statistics

### Averages
- **Mean**: Sum of values ÷ number of values
- **Median**: Middle value when ordered
- **Mode**: Most frequent value
- **Range**: Largest - smallest

### Data Representation
- **Bar charts**: Categorical data
- **Histograms**: Continuous data (equal class widths)
- **Scatter graphs**: Relationship between two variables
- **Line graphs**: Changes over time

### Correlation
- **Positive**: As x increases, y increases
- **Negative**: As x increases, y decreases
- **No correlation**: No clear pattern',
'Mathematics', 'Statistics', '9', ARRAY['probability', 'statistics', 'averages', 'data']),

('Sequences and nth Term', 
'# Sequences and nth Term

A sequence is an ordered list of numbers following a pattern.

## Types of Sequences

### Arithmetic Sequences
Each term is found by adding a constant (common difference, d).

**nth term formula**: **aₙ = a₁ + (n - 1)d**
- a₁ = first term
- d = common difference

Example: 5, 8, 11, 14, ...
- a₁ = 5, d = 3
- nth term = 5 + (n - 1) × 3 = 3n + 2

### Geometric Sequences
Each term is found by multiplying by a constant (common ratio, r).

**nth term formula**: **aₙ = a₁ × rⁿ⁻¹**

Example: 2, 6, 18, 54, ...
- a₁ = 2, r = 3
- nth term = 2 × 3ⁿ⁻¹

### Fibonacci Sequence
Each term is the sum of the two previous terms: 1, 1, 2, 3, 5, 8, 13, ...

## Finding Terms
- Substitute n into the nth term formula
- To find which term equals a value, set nth term = value and solve',
'Mathematics', 'Algebra', '9', ARRAY['sequences', 'nth term', 'arithmetic', 'geometric']),

('Transformations and Congruence', 
'# Transformations and Congruence

## Transformations

Moving shapes without changing their size or shape.

### Translation
Moving a shape in a straight line.
- Described by a **vector** (x, y)
- All points move the same distance and direction

### Rotation
Turning a shape around a point.
- Need: **centre of rotation**, **angle**, **direction** (clockwise/anticlockwise)

### Reflection
Flipping a shape across a mirror line.
- Need: **line of reflection**
- Each point is the same distance from the line on the opposite side

### Enlargement
Making a shape bigger or smaller.
- Need: **centre of enlargement**, **scale factor**
- Scale factor > 1: bigger
- Scale factor < 1: smaller
- Scale factor < 0: inverted

## Congruence

Two shapes are **congruent** if they are identical in shape and size.

### Tests for Triangle Congruence
- **SSS**: Three sides equal
- **SAS**: Two sides and included angle equal
- **ASA**: Two angles and included side equal
- **RHS**: Right angle, hypotenuse, and one side equal',
'Mathematics', 'Geometry', '9', ARRAY['transformations', 'congruence', 'translation', 'rotation']),

('Pythagoras Theorem', 
'# Pythagoras Theorem

Pythagoras theorem applies to **right-angled triangles** only.

## The Theorem

**a² + b² = c²**

Where:
- **a** and **b** are the two shorter sides (legs)
- **c** is the longest side (hypotenuse) - opposite the right angle

## Finding the Hypotenuse

If you know both shorter sides:
1. Square both sides
2. Add them together
3. Square root the answer

Example:
Triangle with sides 3cm and 4cm
c² = 3² + 4² = 9 + 16 = 25
c = √25 = 5cm

## Finding a Shorter Side

If you know the hypotenuse and one side:
1. Square both known sides
2. Subtract: hypotenuse² - side²
3. Square root the answer

Example:
Hypotenuse = 13cm, one side = 5cm
a² = 13² - 5² = 169 - 25 = 144
a = √144 = 12cm

## Applications
- Finding distances
- Checking if triangles are right-angled
- Construction and engineering',
'Mathematics', 'Geometry', '9', ARRAY['Pythagoras', 'right-angled triangles', 'hypotenuse']),

('Circle Theorems Introduction', 
'# Circle Theorems Introduction

## Basic Circle Properties

### Key Terms
- **Radius**: Distance from centre to edge
- **Diameter**: Distance across circle through centre (2 × radius)
- **Chord**: Line joining two points on the circle
- **Tangent**: Line touching circle at one point
- **Arc**: Part of the circumference
- **Sector**: Region between two radii and an arc
- **Segment**: Region between a chord and an arc

## Important Theorems

### 1. Angle at Centre
**Angle at centre = 2 × angle at circumference**

### 2. Angle in Semicircle
**Angle in a semicircle is always 90°**

### 3. Angles in Same Segment
**Angles subtended by the same arc are equal**

### 4. Opposite Angles in Cyclic Quadrilateral
**Opposite angles add up to 180°**

### 5. Tangent and Radius
**Tangent is perpendicular to radius at point of contact**

## Using Theorems
- Identify which theorem applies
- Set up equation
- Solve for unknown angle',
'Mathematics', 'Geometry', '9', ARRAY['circle theorems', 'angles', 'geometry']),

-- =====================
-- BIOLOGY (10 notes)
-- =====================

('Cell Structure and Organelles', 
'# Cell Structure and Organelles

All living things are made of cells. Cells are the basic units of life.

## Animal Cells

### Key Structures
- **Nucleus**: Contains DNA, controls cell activities
- **Cytoplasm**: Gel-like substance where chemical reactions occur
- **Cell Membrane**: Controls what enters and leaves the cell
- **Mitochondria**: Site of aerobic respiration, produces ATP energy
- **Ribosomes**: Site of protein synthesis

## Plant Cells

Plant cells have all animal cell structures PLUS:
- **Cell Wall**: Rigid structure made of cellulose, provides support
- **Chloroplasts**: Contain chlorophyll, site of photosynthesis
- **Permanent Vacuole**: Stores cell sap, maintains turgor pressure

## Specialised Cells

Cells adapt their structure for specific functions:
- **Red blood cells**: No nucleus, biconcave shape for oxygen transport
- **Nerve cells**: Long extensions (axons) for transmitting signals
- **Root hair cells**: Large surface area for water absorption
- **Palisade cells**: Many chloroplasts for photosynthesis

## Cell Organisation
Cells → Tissues → Organs → Organ Systems → Organisms',
'Biology', 'Cell Biology', '9', ARRAY['cells', 'organelles', 'structure', 'specialisation']),

('Photosynthesis', 
'# Photosynthesis

Photosynthesis is the process by which plants make their own food using light energy.

## The Process

**Carbon Dioxide + Water → Glucose + Oxygen**
(light energy and chlorophyll required)

Word equation:
6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂

## Where It Happens
- **Organelle**: Chloroplasts
- **Pigment**: Chlorophyll (absorbs light energy)
- **Location**: Mainly in leaves (palisade mesophyll cells)

## Factors Affecting Rate

### 1. Light Intensity
- More light = faster rate (up to a point)
- Graph shows positive correlation then plateaus

### 2. Carbon Dioxide Concentration
- More CO₂ = faster rate (up to a point)
- Becomes limiting factor at high levels

### 3. Temperature
- Higher temperature = faster rate (up to optimum)
- Too high: enzymes denature, rate decreases

## Uses of Glucose
- **Respiration**: Energy for cell processes
- **Starch**: Storage (insoluble, doesn''t affect osmosis)
- **Cellulose**: Cell wall structure
- **Proteins**: Growth and repair (with nitrates)',
'Biology', 'Bioenergetics', '9', ARRAY['photosynthesis', 'plants', 'glucose', 'chlorophyll']),

('Respiration', 
'# Respiration

Respiration is the process of releasing energy from glucose.

## Types of Respiration

### Aerobic Respiration
Uses oxygen, produces more energy.

**Glucose + Oxygen → Carbon Dioxide + Water + Energy**

C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Energy

- Occurs in: **Mitochondria**
- Produces: ~38 ATP molecules per glucose
- Used for: Active processes (movement, growth, etc.)

### Anaerobic Respiration
Does not use oxygen, produces less energy.

**In muscles**: Glucose → Lactic Acid + Energy
- Produces: ~2 ATP molecules per glucose
- Causes: Muscle fatigue and cramp
- Oxygen debt: Lactic acid converted back to glucose after exercise

**In yeast**: Glucose → Ethanol + Carbon Dioxide + Energy
- Used in: Baking (CO₂ makes bread rise) and brewing

## Comparison
- Aerobic: More efficient, requires oxygen, produces CO₂ and H₂O
- Anaerobic: Less efficient, no oxygen needed, produces waste products',
'Biology', 'Bioenergetics', '9', ARRAY['respiration', 'aerobic', 'anaerobic', 'energy', 'ATP']),

('Digestive System', 
'# Digestive System

The digestive system breaks down food into molecules small enough to be absorbed.

## The Process

### 1. Ingestion
Taking food into the mouth

### 2. Digestion
Breaking down large molecules into smaller ones

**Mechanical**: Chewing, churning in stomach
**Chemical**: Enzymes break down food molecules

### 3. Absorption
Small molecules pass into the bloodstream (mainly in small intestine)

### 4. Egestion
Removal of undigested waste (faeces)

## Key Organs

### Mouth
- Teeth: Mechanical digestion
- Saliva: Contains amylase (starts starch digestion)

### Stomach
- Acidic environment (pH 2)
- Produces protease enzymes
- Churns food (mechanical digestion)

### Small Intestine
- **Duodenum**: Receives enzymes from pancreas and bile from liver
- **Ileum**: Main site of absorption
- **Villi**: Finger-like projections increase surface area for absorption

### Large Intestine
- Absorbs water
- Forms faeces

## Enzymes
- **Amylase**: Starch → Maltose
- **Protease**: Proteins → Amino acids
- **Lipase**: Fats → Fatty acids + Glycerol',
'Biology', 'Organisation', '9', ARRAY['digestion', 'enzymes', 'absorption', 'intestine']),

('Circulatory System', 
'# Circulatory System

The circulatory system transports substances around the body.

## Components

### Blood
**Plasma** (55%): Liquid carrying dissolved substances
- Transports: Nutrients, hormones, waste, heat

**Red Blood Cells** (45%): Carry oxygen
- No nucleus (more space for haemoglobin)
- Biconcave shape (large surface area)
- Contains haemoglobin (binds oxygen)

**White Blood Cells**: Defend against pathogens
- Phagocytes: Engulf pathogens
- Lymphocytes: Produce antibodies

**Platelets**: Clot blood to prevent bleeding

### Blood Vessels

**Arteries**: Carry blood away from heart
- Thick, muscular walls
- High pressure
- No valves

**Veins**: Carry blood to heart
- Thinner walls
- Lower pressure
- Valves prevent backflow

**Capillaries**: Exchange substances with tissues
- One cell thick (short diffusion distance)
- Narrow (slows blood flow for exchange)

### Heart
Four-chambered pump:
- **Right side**: Pumps deoxygenated blood to lungs
- **Left side**: Pumps oxygenated blood to body
- **Valves**: Prevent backflow',
'Biology', 'Organisation', '9', ARRAY['circulatory', 'heart', 'blood', 'vessels']),

('Respiratory System', 
'# Respiratory System

The respiratory system exchanges gases between the body and environment.

## Structure

### Nose/Mouth
- Warms and filters air
- Hairs and mucus trap particles

### Trachea (Windpipe)
- Rings of cartilage keep it open
- Lined with cilia and mucus (trap particles)

### Bronchi and Bronchioles
- Branching tubes leading to alveoli
- Smooth muscle controls diameter

### Alveoli (Air Sacs)
- Millions of tiny air sacs
- Site of gas exchange
- Adaptations:
  - Large surface area
  - Thin walls (one cell thick)
  - Moist surface
  - Good blood supply

## Gas Exchange

### In Alveoli
**Oxygen**: Moves from alveoli → blood (high to low concentration)
**Carbon Dioxide**: Moves from blood → alveoli

### Mechanism
- Diffusion: Movement from high to low concentration
- Oxygen binds to haemoglobin in red blood cells
- Carbon dioxide dissolves in plasma

## Breathing

### Inhalation
- Diaphragm contracts (flattens)
- Intercostal muscles contract
- Ribs move up and out
- Volume increases, pressure decreases
- Air rushes in

### Exhalation
- Diaphragm relaxes (domes up)
- Intercostal muscles relax
- Ribs move down and in
- Volume decreases, pressure increases
- Air forced out',
'Biology', 'Organisation', '9', ARRAY['respiration', 'lungs', 'alveoli', 'gas exchange']),

('Enzymes and Their Functions', 
'# Enzymes and Their Functions

Enzymes are biological catalysts that speed up chemical reactions in living organisms.

## Key Properties

### 1. Catalysts
- Speed up reactions without being used up
- Lower activation energy needed for reactions

### 2. Specificity
- Each enzyme works on specific substrates
- **Lock and key model**: Substrate fits into active site like a key

### 3. Reusability
- Not changed by the reaction
- Can catalyse many reactions

## Factors Affecting Enzyme Activity

### Temperature
- **Optimum**: Peak activity (usually 37°C for human enzymes)
- **Too low**: Slow reactions (less kinetic energy)
- **Too high**: Denaturation (active site changes shape, enzyme stops working)

### pH
- Each enzyme has an **optimum pH**
- Too acidic or alkaline: Denaturation
- Examples:
  - Stomach protease: pH 2
  - Intestinal enzymes: pH 7-8

### Substrate Concentration
- More substrate = faster rate (up to a point)
- All enzymes become saturated (working at maximum rate)

## Types of Enzymes

### Digestive Enzymes
- **Amylase**: Starch → Maltose (mouth, small intestine)
- **Protease**: Proteins → Amino acids (stomach, small intestine)
- **Lipase**: Fats → Fatty acids + Glycerol (small intestine)',
'Biology', 'Organisation', '9', ARRAY['enzymes', 'catalysts', 'digestion', 'optimum']),

('Inheritance and Genetics', 
'# Inheritance and Genetics

Genetics explains how characteristics are passed from parents to offspring.

## Key Terms

### DNA and Genes
- **DNA**: Molecule containing genetic information
- **Gene**: Section of DNA coding for a specific protein/characteristic
- **Chromosome**: Long strand of DNA (humans have 46, 23 pairs)
- **Allele**: Different version of the same gene

### Genotype and Phenotype
- **Genotype**: Genetic makeup (e.g., BB, Bb, bb)
- **Phenotype**: Physical appearance (e.g., brown eyes)

### Dominant and Recessive
- **Dominant allele**: Always expressed if present (capital letter, e.g., B)
- **Recessive allele**: Only expressed if both copies present (lowercase, e.g., b)

## Genetic Crosses

### Monohybrid Cross
Crossing one characteristic.

Example: Brown eyes (B) dominant over blue (b)
- Parent 1: BB (homozygous dominant)
- Parent 2: bb (homozygous recessive)
- Offspring: All Bb (heterozygous, brown eyes)

### Punnett Square
Grid showing all possible combinations of alleles.

### Probability
- 50% chance of inheriting each allele from a parent
- Use to predict offspring characteristics',
'Biology', 'Inheritance', '9', ARRAY['genetics', 'inheritance', 'DNA', 'alleles', 'genes']),

('Natural Selection and Evolution', 
'# Natural Selection and Evolution

Evolution explains how species change over time.

## Natural Selection

Charles Darwin''s theory explains how evolution occurs.

### Process
1. **Variation**: Individuals in a species show differences
2. **Competition**: Organisms compete for limited resources
3. **Selection**: Those with advantageous characteristics survive
4. **Reproduction**: Survivors pass on their genes
5. **Evolution**: Species gradually changes over generations

### Example: Peppered Moths
- **Before industrial revolution**: Light moths camouflaged on light trees
- **After pollution**: Dark moths better camouflaged on dark trees
- **Result**: Dark moths became more common (natural selection)

## Evidence for Evolution

### 1. Fossils
- Show how organisms have changed over time
- Older fossils show simpler organisms

### 2. DNA Analysis
- Closely related species have similar DNA
- Can show evolutionary relationships

### 3. Comparative Anatomy
- Similar bone structures in different animals (e.g., human arm, whale flipper)
- Suggests common ancestor

## Speciation

Formation of new species occurs when:
- Populations become isolated (geographical or reproductive)
- Different selection pressures act on each population
- Over time, populations become so different they can no longer interbreed',
'Biology', 'Evolution', '9', ARRAY['evolution', 'natural selection', 'Darwin', 'speciation']),

('Ecosystems and Food Chains', 
'# Ecosystems and Food Chains

An ecosystem includes all living organisms and their physical environment in a particular area.

## Food Chains and Webs

### Food Chain
Shows energy transfer from one organism to another:
**Producer → Primary Consumer → Secondary Consumer → Tertiary Consumer**

Example:
Grass → Rabbit → Fox → Eagle

### Food Web
Multiple interconnected food chains showing complex feeding relationships.

## Key Terms

### Producers
- Plants and algae
- Make their own food via photosynthesis
- Start of all food chains

### Consumers
- **Primary**: Eat producers (herbivores)
- **Secondary**: Eat primary consumers (carnivores)
- **Tertiary**: Eat secondary consumers (top predators)

### Decomposers
- Bacteria and fungi
- Break down dead matter
- Recycle nutrients back to soil

## Energy Transfer

- Only ~10% of energy is transferred to next trophic level
- 90% lost as:
  - Heat (respiration)
  - Undigested material (faeces)
  - Movement and other life processes

## Biomass
Total mass of living material in a trophic level.
- Decreases up the food chain
- Can be represented as a pyramid',
'Biology', 'Ecology', '9', ARRAY['ecosystems', 'food chains', 'energy transfer', 'biomass']),

('Homeostasis and Blood Glucose Control', 
'# Homeostasis and Blood Glucose Control

Homeostasis is the maintenance of a constant internal environment.

## Why It''s Important

Cells work best within narrow ranges of:
- Temperature
- pH
- Water concentration
- Blood glucose levels

## Blood Glucose Control

### Normal Level
~90mg/100ml blood

### Too High (Hyperglycaemia)
**Problem**: After eating, blood glucose rises

**Solution**: 
- **Pancreas** releases **insulin**
- Insulin causes:
  - Liver and muscles to take up glucose
  - Glucose converted to glycogen (storage)
  - Blood glucose returns to normal

### Too Low (Hypoglycaemia)
**Problem**: During exercise, blood glucose falls

**Solution**:
- **Pancreas** releases **glucagon**
- Glucagon causes:
  - Liver to break down glycogen → glucose
  - Blood glucose returns to normal

## Negative Feedback

This is a **negative feedback mechanism**:
- Change detected → Response made → Change reversed
- Maintains balance

## Diabetes

**Type 1**: Pancreas doesn''t produce insulin
- Treatment: Insulin injections

**Type 2**: Body becomes resistant to insulin
- Often linked to obesity
- Treatment: Diet, exercise, medication',
'Biology', 'Homeostasis', '9', ARRAY['homeostasis', 'blood glucose', 'insulin', 'glucagon', 'diabetes']),

-- =====================
-- CHEMISTRY (10 notes)
-- =====================

('Atomic Structure and the Periodic Table', 
'# Atomic Structure and the Periodic Table

## Atomic Structure

Atoms consist of three subatomic particles:

### Protons
- **Charge**: +1
- **Mass**: 1
- **Location**: Nucleus

### Neutrons
- **Charge**: 0 (neutral)
- **Mass**: 1
- **Location**: Nucleus

### Electrons
- **Charge**: -1
- **Mass**: Negligible (1/1836 of proton)
- **Location**: Shells around nucleus

## Key Numbers

### Atomic Number (Z)
- Number of **protons**
- Also equals number of electrons in neutral atom
- Determines the element

### Mass Number (A)
- Number of **protons + neutrons**
- Total particles in nucleus

## Electron Shells

Electrons occupy energy levels (shells):
- **1st shell**: Maximum 2 electrons
- **2nd shell**: Maximum 8 electrons
- **3rd shell**: Maximum 8 electrons (for first 20 elements)

## The Periodic Table

### Groups (Columns)
- **Group number** = Number of electrons in outer shell
- Elements in same group have similar properties

### Periods (Rows)
- **Period number** = Number of electron shells

### Trends
- **Metals**: Left side (lose electrons)
- **Non-metals**: Right side (gain electrons)
- **Noble gases**: Group 0 (full outer shell, unreactive)',
'Chemistry', 'Atomic Structure', '9', ARRAY['atoms', 'periodic table', 'electrons', 'protons']),

('Ionic Bonding', 
'# Ionic Bonding

Ionic bonding occurs between **metals and non-metals**.

## The Process

### Electron Transfer
- **Metal atoms**: Lose electrons → become **positive ions** (cations)
- **Non-metal atoms**: Gain electrons → become **negative ions** (anions)
- **Opposite charges attract** → ionic bond forms

### Example: Sodium Chloride (NaCl)
- Sodium (Na): Loses 1 electron → Na⁺
- Chlorine (Cl): Gains 1 electron → Cl⁻
- Ions attract → NaCl crystal

## Properties of Ionic Compounds

### High Melting/Boiling Points
- Strong electrostatic forces between ions
- Require lots of energy to break

### Conduct Electricity
- **When molten or dissolved**: Ions are free to move
- **When solid**: Ions fixed in position, cannot conduct

### Solubility
- Most dissolve in water
- Water molecules surround and separate ions

## Dot and Cross Diagrams

Show electron transfer:
- **Dots**: Electrons from one atom
- **Crosses**: Electrons from other atom
- Show only outer shell electrons',
'Chemistry', 'Bonding', '9', ARRAY['ionic bonding', 'ions', 'electron transfer', 'compounds']),

('Covalent Bonding', 
'# Covalent Bonding

Covalent bonding occurs between **non-metal atoms** sharing electrons.

## The Process

### Electron Sharing
- Atoms share pairs of electrons
- Each atom achieves a full outer shell
- **No ions formed** (no electron transfer)

### Single Bonds
One shared pair of electrons.

Example: Hydrogen (H₂)
- Each H has 1 electron
- Share 1 pair → both have 2 electrons (full shell)

### Double Bonds
Two shared pairs of electrons.

Example: Oxygen (O₂)
- Each O has 6 outer electrons
- Share 2 pairs → both have 8 electrons (full shell)

### Triple Bonds
Three shared pairs of electrons.

Example: Nitrogen (N₂)

## Properties of Covalent Compounds

### Low Melting/Boiling Points
- Weak intermolecular forces
- Easy to break (not the bonds, but forces between molecules)

### Do Not Conduct Electricity
- No free ions or electrons
- Cannot carry charge

### Solubility
- Most are insoluble in water
- Some small molecules (e.g., CO₂) dissolve

## Giant Covalent Structures

Some covalent substances form giant structures:
- **Diamond**: Each carbon bonded to 4 others (very hard)
- **Graphite**: Layers of carbon (conducts electricity)
- **Silicon Dioxide**: Similar to diamond structure',
'Chemistry', 'Bonding', '9', ARRAY['covalent bonding', 'electron sharing', 'molecules']),

('Metallic Bonding', 
'# Metallic Bonding

Metallic bonding occurs in **metals only**.

## Structure

### Positive Ions
- Metal atoms lose outer electrons
- Form positive ions (cations)
- Arranged in regular lattice

### Delocalised Electrons
- Lost electrons move freely
- Form "sea of electrons"
- Not attached to any specific atom

### Bonding
- **Electrostatic attraction** between:
  - Positive metal ions
  - Negative delocalised electrons

## Properties of Metals

### High Melting/Boiling Points
- Strong metallic bonds
- Require lots of energy to break

### Good Conductors of Electricity
- Delocalised electrons carry charge
- Can move through the structure

### Good Conductors of Heat
- Delocalised electrons transfer energy
- Vibrations pass through lattice

### Malleable and Ductile
- Layers of ions can slide
- Can be hammered (malleable) or drawn into wires (ductile)
- Bonds not broken, just layers move

### Shiny (Lustrous)
- Electrons reflect light',
'Chemistry', 'Bonding', '9', ARRAY['metallic bonding', 'delocalised electrons', 'metals']),

('Acids, Bases and Salts', 
'# Acids, Bases and Salts

## Definitions

### Acids
- **pH < 7**
- Release **H⁺ ions** in water
- Taste sour
- Turn blue litmus red

### Bases
- **pH > 7**
- Release **OH⁻ ions** in water
- Feel slippery
- Turn red litmus blue

### Alkalis
- Bases that dissolve in water
- Examples: Sodium hydroxide (NaOH), Potassium hydroxide (KOH)

## The pH Scale

0-14 scale measuring acidity/alkalinity:
- **0-6**: Acidic (stronger acid = lower number)
- **7**: Neutral
- **8-14**: Alkaline (stronger alkali = higher number)

## Neutralisation

**Acid + Base → Salt + Water**

Example:
Hydrochloric acid + Sodium hydroxide → Sodium chloride + Water
HCl + NaOH → NaCl + H₂O

### Uses
- Treating indigestion (antacids)
- Treating acidic soil
- Making salts

## Making Salts

### Acid + Metal
Acid + Metal → Salt + Hydrogen

### Acid + Base
Acid + Base → Salt + Water

### Acid + Carbonate
Acid + Carbonate → Salt + Water + Carbon Dioxide',
'Chemistry', 'Acids and Bases', '9', ARRAY['acids', 'bases', 'pH', 'neutralisation', 'salts']),

('The Reactivity Series', 
'# The Reactivity Series

The reactivity series orders metals by how easily they react.

## The Series

**Most Reactive**
Potassium (K)
Sodium (Na)
Calcium (Ca)
Magnesium (Mg)
Aluminium (Al)
Carbon (C)
Zinc (Zn)
Iron (Fe)
Tin (Sn)
Lead (Pb)
Hydrogen (H)
Copper (Cu)
Silver (Ag)
Gold (Au)
**Least Reactive**

## Key Rules

### Displacement Reactions
A more reactive metal can **displace** a less reactive metal from its compound.

Example:
Zinc + Copper Sulfate → Zinc Sulfate + Copper
(Zn is more reactive than Cu)

### Reaction with Water
- **Potassium, Sodium, Calcium**: React with cold water
- **Magnesium**: Reacts with steam
- **Below magnesium**: Do not react

### Reaction with Acids
- **Above hydrogen**: React with acids, produce hydrogen gas
- **Below hydrogen**: Do not react with acids

## Extraction of Metals

### Unreactive Metals
- **Gold, Silver**: Found as native metals (pure)
- No extraction needed

### Moderately Reactive
- **Zinc, Iron, Tin**: Extracted by reduction with carbon
- Carbon displaces metal from oxide

### Very Reactive
- **Aluminium, Sodium**: Extracted by electrolysis
- Too reactive for carbon reduction',
'Chemistry', 'Reactivity', '9', ARRAY['reactivity series', 'displacement', 'extraction']),

('Rates of Reaction', 
'# Rates of Reaction

The rate of reaction measures how fast reactants are converted to products.

## Factors Affecting Rate

### 1. Temperature
- **Higher temperature** = Faster rate
- **Reason**: Particles have more kinetic energy
- More frequent collisions
- More collisions with sufficient energy (activation energy)

### 2. Concentration (or Pressure for Gases)
- **Higher concentration** = Faster rate
- **Reason**: More particles per unit volume
- More frequent collisions

### 3. Surface Area
- **Larger surface area** = Faster rate
- **Reason**: More particles exposed
- More collisions possible
- Powder reacts faster than lumps

### 4. Catalysts
- **Catalyst present** = Faster rate
- **Reason**: Provides alternative reaction pathway
- Lower activation energy needed
- **Not used up** in the reaction

## Measuring Rate

### Methods
- **Volume of gas produced** (gas syringe)
- **Mass loss** (if gas escapes)
- **Time for precipitate to form** (disappearing cross)
- **Change in pH or conductivity**

### Rate Calculation
**Rate = Change in amount / Time**

Example:
If 50cm³ of gas produced in 20 seconds:
Rate = 50 / 20 = 2.5 cm³/s',
'Chemistry', 'Rates of Reaction', '9', ARRAY['rates', 'temperature', 'catalysts', 'collision theory']),

('Energy Changes in Reactions', 
'# Energy Changes in Reactions

Chemical reactions involve energy changes.

## Types of Reactions

### Exothermic Reactions
**Release energy to surroundings**
- Temperature of surroundings **increases**
- Products have **less energy** than reactants
- Examples:
  - Combustion (burning)
  - Neutralisation
  - Respiration

### Endothermic Reactions
**Take in energy from surroundings**
- Temperature of surroundings **decreases**
- Products have **more energy** than reactants
- Examples:
  - Thermal decomposition
  - Photosynthesis
  - Electrolysis

## Energy Level Diagrams

### Exothermic
```
Reactants (high energy)
    ↓
    ↓ (energy released)
    ↓
Products (low energy)
```

### Endothermic
```
Reactants (low energy)
    ↑
    ↑ (energy absorbed)
    ↑
Products (high energy)
```

## Activation Energy

**Minimum energy needed for reaction to start**
- Even exothermic reactions need energy to begin
- Shown as "hump" on energy diagram
- Catalysts lower activation energy

## Bond Energy

- **Breaking bonds**: Requires energy (endothermic)
- **Making bonds**: Releases energy (exothermic)
- Overall energy change = Energy in - Energy out',
'Chemistry', 'Energy Changes', '9', ARRAY['exothermic', 'endothermic', 'energy', 'activation']),

('Crude Oil and Hydrocarbons', 
'# Crude Oil and Hydrocarbons

Crude oil is a mixture of hydrocarbons formed from ancient marine organisms.

## Hydrocarbons

Compounds containing **only carbon and hydrogen**.

### Alkanes
- **General formula**: CₙH₂ₙ₊₂
- **Single bonds only** (saturated)
- Examples:
  - Methane: CH₄
  - Ethane: C₂H₆
  - Propane: C₃H₈
  - Butane: C₄H₁₀

### Properties
- **Short chains**: Low boiling point, volatile, flammable
- **Long chains**: High boiling point, viscous, less flammable

## Fractional Distillation

Crude oil is separated into fractions by boiling point.

### Process
1. Crude oil heated to ~350°C
2. Vapours rise up fractionating column
3. **Temperature decreases** up the column
4. Fractions **condense** at different levels
5. Collected at different heights

### Fractions (Bottom to Top)
- **Bitumen**: Highest boiling point, used for roads
- **Fuel oil**: Heating, ships
- **Diesel**: Vehicles
- **Kerosene**: Aircraft fuel
- **Petrol**: Cars
- **Gases**: Lowest boiling point, bottled gas

## Cracking

Breaking long-chain hydrocarbons into shorter, more useful ones.

### Conditions
- High temperature (~600°C)
- Catalyst (aluminium oxide)

### Products
- Shorter alkanes (fuels)
- Alkenes (for making plastics)

### Why?
- High demand for short-chain fuels
- Long chains less useful',
'Chemistry', 'Organic Chemistry', '9', ARRAY['crude oil', 'hydrocarbons', 'fractional distillation', 'cracking']),

('The Earth''s Atmosphere', 
'# The Earth''s Atmosphere

The atmosphere is a layer of gases surrounding Earth.

## Composition Today

- **78%** Nitrogen (N₂)
- **21%** Oxygen (O₂)
- **1%** Argon (Ar)
- **0.04%** Carbon Dioxide (CO₂)
- Trace amounts of other gases

## Evolution of the Atmosphere

### Phase 1: Early Earth (4.6 billion years ago)
- Intense volcanic activity
- Released: CO₂, water vapour, nitrogen, methane, ammonia
- **No oxygen**

### Phase 2: Oceans Form
- Water vapour condensed → oceans
- CO₂ dissolved in oceans
- Some CO₂ formed carbonate rocks

### Phase 3: Life Begins
- First organisms (3.4 billion years ago)
- **Photosynthesis** started producing oxygen
- Oxygen levels gradually increased

### Phase 4: Modern Atmosphere
- Oxygen levels reached current levels
- Ozone layer formed (protects from UV)
- Life could exist on land

## Greenhouse Effect

### Natural Process
1. Sun''s energy reaches Earth
2. Some reflected, some absorbed
3. Earth radiates heat (infrared)
4. Greenhouse gases trap some heat
5. Keeps Earth warm enough for life

### Enhanced Greenhouse Effect
- Human activities increase CO₂ levels
- More heat trapped
- Global warming and climate change

### Sources of CO₂
- Burning fossil fuels
- Deforestation
- Industrial processes',
'Chemistry', 'Atmosphere', '9', ARRAY['atmosphere', 'greenhouse effect', 'climate change', 'oxygen']),

('Electrolysis', 
'# Electrolysis

Electrolysis uses electricity to break down ionic compounds.

## The Process

### Setup
- **Electrolyte**: Molten or dissolved ionic compound
- **Electrodes**: Conduct electricity
  - **Anode**: Positive electrode (attracts negative ions)
  - **Cathode**: Negative electrode (attracts positive ions)

### What Happens

**At the Anode (Oxidation)**
- Negative ions lose electrons
- Become neutral atoms/molecules
- Example: 2Cl⁻ → Cl₂ + 2e⁻

**At the Cathode (Reduction)**
- Positive ions gain electrons
- Become neutral atoms
- Example: Cu²⁺ + 2e⁻ → Cu

## Examples

### Electrolysis of Copper Sulfate
- **Cathode**: Copper deposited (Cu²⁺ + 2e⁻ → Cu)
- **Anode**: Oxygen produced (4OH⁻ → O₂ + 2H₂O + 4e⁻)

### Electrolysis of Molten Lead Bromide
- **Cathode**: Lead produced (Pb²⁺ + 2e⁻ → Pb)
- **Anode**: Bromine produced (2Br⁻ → Br₂ + 2e⁻)

## Uses

- **Extracting reactive metals** (aluminium, sodium)
- **Electroplating** (coating objects with metal)
- **Purifying copper**
- **Making chlorine and hydrogen** from brine',
'Chemistry', 'Electrolysis', '9', ARRAY['electrolysis', 'electrodes', 'oxidation', 'reduction']),

-- =====================
-- PHYSICS (10 notes)
-- =====================

('Energy Stores and Transfers', 
'# Energy Stores and Transfers

Energy cannot be created or destroyed, only transferred between stores.

## Energy Stores

### 1. Kinetic Energy
Energy of moving objects
**KE = ½mv²**
- m = mass (kg)
- v = velocity (m/s)

### 2. Gravitational Potential Energy
Energy due to position in gravitational field
**GPE = mgh**
- m = mass (kg)
- g = gravitational field strength (10 N/kg on Earth)
- h = height (m)

### 3. Elastic Potential Energy
Energy stored in stretched/compressed objects
**EPE = ½ke²**
- k = spring constant
- e = extension

### 4. Thermal Energy
Energy due to temperature

### 5. Chemical Energy
Energy stored in chemical bonds

### 6. Nuclear Energy
Energy stored in atomic nuclei

## Energy Transfers

### Mechanisms
- **Mechanically**: By forces doing work
- **Electrically**: By electric current
- **By heating**: Temperature difference
- **By radiation**: Waves (light, sound)

## Conservation of Energy

**Total energy before = Total energy after**

Energy may be transferred but total amount stays constant.

## Wasted Energy

In real systems, some energy is always "wasted" as thermal energy (heat) due to friction, air resistance, etc.',
'Physics', 'Energy', '9', ARRAY['energy stores', 'energy transfers', 'conservation', 'kinetic']),

('Forces and Motion', 
'# Forces and Motion

Forces cause objects to change their motion.

## Newton''s Laws

### First Law
**An object at rest stays at rest, an object in motion stays in motion, unless acted upon by a force.**
- If forces are balanced: No change in motion
- If forces are unbalanced: Object accelerates

### Second Law
**F = ma**
- F = Force (N)
- m = Mass (kg)
- a = Acceleration (m/s²)

Larger force = Greater acceleration
Larger mass = Smaller acceleration (for same force)

### Third Law
**For every action, there is an equal and opposite reaction.**
- Forces always come in pairs
- Act on different objects

## Types of Forces

### Contact Forces
- **Friction**: Opposes motion
- **Air resistance**: Opposes motion through air
- **Normal force**: Perpendicular to surface
- **Tension**: In ropes/strings

### Non-Contact Forces
- **Gravity**: Attraction between masses
- **Magnetic**: Between magnets
- **Electrostatic**: Between charges

## Weight vs Mass

- **Mass**: Amount of matter (kg) - same everywhere
- **Weight**: Force of gravity (N) - depends on location
- **W = mg** (g = 10 N/kg on Earth)',
'Physics', 'Forces', '9', ARRAY['forces', 'Newton''s laws', 'motion', 'acceleration']),

('Electricity and Circuits', 
'# Electricity and Circuits

Electricity is the flow of electric charge.

## Key Terms

### Current (I)
- Flow of electric charge
- Measured in **Amperes (A)**
- Measured with **ammeter** (connected in series)

### Voltage (V)
- Energy transferred per unit charge
- Also called **potential difference**
- Measured in **Volts (V)**
- Measured with **voltmeter** (connected in parallel)

### Resistance (R)
- Opposition to current flow
- Measured in **Ohms (Ω)**

## Ohm''s Law

**V = IR**
- V = Voltage (V)
- I = Current (A)
- R = Resistance (Ω)

## Circuit Rules

### Series Circuits
- **Current**: Same at all points
- **Voltage**: Shared between components
- **Resistance**: Total = R₁ + R₂ + R₃
- **Disadvantage**: If one breaks, all stop

### Parallel Circuits
- **Current**: Splits between branches
- **Voltage**: Same across each branch
- **Resistance**: 1/Total = 1/R₁ + 1/R₂ + 1/R₃
- **Advantage**: Components work independently

## Components

- **Battery**: Provides voltage
- **Resistor**: Limits current
- **Bulb**: Converts electrical to light energy
- **Switch**: Controls current flow',
'Physics', 'Electricity', '9', ARRAY['electricity', 'circuits', 'Ohm''s law', 'current', 'voltage']),

('Waves', 
'# Waves

Waves transfer energy without transferring matter.

## Types of Waves

### Transverse Waves
- Particles vibrate **perpendicular** to wave direction
- Examples: Light, water waves, S-waves (seismic)

### Longitudinal Waves
- Particles vibrate **parallel** to wave direction
- Examples: Sound, P-waves (seismic)

## Wave Properties

### Amplitude
- Maximum displacement from rest position
- Related to **energy** (larger amplitude = more energy)

### Wavelength (λ)
- Distance between two identical points on wave
- Measured in **metres (m)**

### Frequency (f)
- Number of waves per second
- Measured in **Hertz (Hz)**

### Period (T)
- Time for one complete wave
- **T = 1/f**

## Wave Equation

**v = fλ**
- v = Wave speed (m/s)
- f = Frequency (Hz)
- λ = Wavelength (m)

## Electromagnetic Spectrum

All EM waves travel at speed of light (3 × 10⁸ m/s)

**Low frequency → High frequency:**
Radio → Microwaves → Infrared → Visible → UV → X-rays → Gamma

**Low energy → High energy:**
Radio waves have lowest energy, gamma rays have highest',
'Physics', 'Waves', '9', ARRAY['waves', 'frequency', 'wavelength', 'electromagnetic']),

('Magnetism and Electromagnetism', 
'# Magnetism and Electromagnetism

## Magnets

### Properties
- Have **north and south poles**
- **Like poles repel**, **unlike poles attract**
- Surrounded by **magnetic field**
- Field lines go from **north to south**

### Magnetic Materials
- **Ferromagnetic**: Strongly attracted (iron, nickel, cobalt)
- **Paramagnetic**: Weakly attracted
- **Diamagnetic**: Repelled

## Electromagnets

### Making an Electromagnet
- Coil of wire (solenoid)
- Electric current passes through
- Creates magnetic field
- **Stronger if**:
  - More turns of wire
  - Larger current
  - Iron core inserted

### Uses
- Electric motors
- Loudspeakers
- MRI scanners
- Maglev trains

## Motor Effect

When current-carrying wire is in magnetic field:
- **Force** acts on wire
- Direction depends on:
  - Direction of current
  - Direction of magnetic field

### Fleming''s Left Hand Rule
- **Thumb**: Motion/Force
- **First finger**: Magnetic field
- **Second finger**: Current

## Generators

Opposite of motor:
- **Mechanical energy** → **Electrical energy**
- Wire moves in magnetic field
- **Induced current** produced
- Used in power stations',
'Physics', 'Magnetism', '9', ARRAY['magnetism', 'electromagnets', 'motor effect', 'generators']),

('Particle Model of Matter', 
'# Particle Model of Matter

All matter is made of tiny particles.

## States of Matter

### Solid
- Particles: **Close together**, **vibrate** in fixed positions
- **Fixed shape and volume**
- Strong forces between particles

### Liquid
- Particles: **Close together**, can **move past each other**
- **Fixed volume**, **takes shape of container**
- Weaker forces than solid

### Gas
- Particles: **Far apart**, **move freely**
- **No fixed shape or volume**
- Very weak forces

## State Changes

### Melting
Solid → Liquid
- Particles gain energy
- Break free from fixed positions

### Boiling/Evaporation
Liquid → Gas
- Particles gain enough energy to escape

### Condensation
Gas → Liquid
- Particles lose energy
- Come closer together

### Freezing
Liquid → Solid
- Particles lose energy
- Lock into fixed positions

## Density

**Density = Mass / Volume**
- Units: kg/m³ or g/cm³
- **Solid**: Usually highest density
- **Liquid**: Medium density
- **Gas**: Lowest density

## Pressure

**Pressure = Force / Area**
- Units: Pa (Pascals) or N/m²
- In gases: Due to particles colliding with container walls',
'Physics', 'Particle Model', '9', ARRAY['states of matter', 'particles', 'density', 'pressure']),

('Work, Power and Efficiency', 
'# Work, Power and Efficiency

## Work

Work is done when a force moves an object.

**W = Fd**
- W = Work done (Joules, J)
- F = Force (Newtons, N)
- d = Distance moved in direction of force (metres, m)

### When Work is Done
- Object must **move**
- Force must be in **direction of movement**
- If force perpendicular to movement: **No work done**

## Power

Power is the **rate of doing work** (how fast energy is transferred).

**P = W/t** or **P = E/t**
- P = Power (Watts, W)
- W = Work done (J)
- E = Energy transferred (J)
- t = Time (seconds, s)

**1 Watt = 1 Joule per second**

## Efficiency

Efficiency measures how much useful energy we get from total energy input.

**Efficiency = (Useful Energy Out / Total Energy In) × 100%**

Or:
**Efficiency = (Useful Power Out / Total Power In) × 100%**

### Improving Efficiency
- Reduce friction (lubrication)
- Reduce air resistance (streamlining)
- Reduce heat loss (insulation)
- Use more efficient machines

### Energy Flow
**Total Energy In = Useful Energy Out + Wasted Energy**

Wasted energy usually becomes **thermal energy** (heat)',
'Physics', 'Energy', '9', ARRAY['work', 'power', 'efficiency', 'energy']),

('Pressure and Moments', 
'# Pressure and Moments

## Pressure

Pressure is force per unit area.

**P = F/A**
- P = Pressure (Pa or N/m²)
- F = Force (N)
- A = Area (m²)

### Pressure in Liquids
**P = ρgh**
- ρ = Density (kg/m³)
- g = Gravitational field strength (10 N/kg)
- h = Depth (m)

**Pressure increases with depth**

### Pressure in Gases
- Due to particles colliding with surfaces
- **Atmospheric pressure**: ~100,000 Pa at sea level
- Decreases with altitude

## Moments

A moment is the turning effect of a force.

**M = Fd**
- M = Moment (Newton-metres, Nm)
- F = Force (N)
- d = Perpendicular distance from pivot (m)

### Principle of Moments

For an object in equilibrium:
**Sum of clockwise moments = Sum of anticlockwise moments**

### Levers
- **Effort**: Force you apply
- **Load**: Force you want to overcome
- **Pivot**: Point of rotation
- **Mechanical advantage**: Load / Effort

### Examples
- Scissors (class 1 lever)
- Wheelbarrow (class 2 lever)
- Tweezers (class 3 lever)',
'Physics', 'Forces', '9', ARRAY['pressure', 'moments', 'levers', 'turning effect']),

('Atomic Structure and Radioactivity', 
'# Atomic Structure and Radioactivity

## Atomic Structure

### Nucleus
- Contains **protons** (positive) and **neutrons** (neutral)
- Very small but contains most of atom''s mass

### Electrons
- Orbit nucleus in **shells**
- Very light, negative charge
- Most of atom is **empty space**

## Isotopes

Atoms of same element with **different numbers of neutrons**.

Example: Carbon-12 and Carbon-14
- Both have 6 protons
- Carbon-12: 6 neutrons
- Carbon-14: 8 neutrons

## Radioactivity

Unstable nuclei emit radiation to become stable.

### Types of Radiation

#### Alpha (α)
- **2 protons + 2 neutrons** (helium nucleus)
- **Heaviest**, **most ionising**, **least penetrating**
- Stopped by: Paper or skin

#### Beta (β)
- **Fast-moving electron**
- **Medium ionising**, **medium penetrating**
- Stopped by: Thin metal (e.g., aluminium)

#### Gamma (γ)
- **Electromagnetic wave**
- **Least ionising**, **most penetrating**
- Stopped by: Thick lead or concrete

## Half-Life

Time for **half** the radioactive nuclei to decay.

- Constant for each isotope
- Cannot be changed
- Used to date materials',
'Physics', 'Atomic Structure', '9', ARRAY['atoms', 'radioactivity', 'alpha', 'beta', 'gamma', 'half-life']),

('Speed, Velocity and Acceleration', 
'# Speed, Velocity and Acceleration

## Speed

Speed is distance travelled per unit time.

**Speed = Distance / Time**
- Units: m/s or km/h

### Average Speed
Total distance ÷ Total time

### Instantaneous Speed
Speed at a particular moment

## Velocity

Velocity is **speed in a given direction**.
- **Vector quantity** (has magnitude and direction)
- Speed is **scalar** (magnitude only)

### Example
- Speed: 50 km/h
- Velocity: 50 km/h north

## Acceleration

Acceleration is rate of change of velocity.

**a = (v - u) / t**
- a = Acceleration (m/s²)
- v = Final velocity (m/s)
- u = Initial velocity (m/s)
- t = Time (s)

### Positive Acceleration
- Speeding up
- Velocity increasing

### Negative Acceleration (Deceleration)
- Slowing down
- Velocity decreasing

## Distance-Time Graphs

- **Gradient** = Speed
- **Flat line** = Stationary
- **Steep line** = Fast speed
- **Curved line** = Changing speed (acceleration)

## Velocity-Time Graphs

- **Gradient** = Acceleration
- **Area under graph** = Distance travelled
- **Flat line** = Constant velocity
- **Upward slope** = Acceleration
- **Downward slope** = Deceleration',
'Physics', 'Motion', '9', ARRAY['speed', 'velocity', 'acceleration', 'motion']),

-- =====================
-- ENGLISH (5 notes)
-- =====================

('Analysing Poetry', 
'# Analysing Poetry

Poetry analysis involves examining how language, structure, and form create meaning.

## Language Techniques

### Imagery
- **Simile**: Comparison using "like" or "as" (e.g., "as brave as a lion")
- **Metaphor**: Direct comparison (e.g., "life is a journey")
- **Personification**: Giving human qualities to non-human things

### Sound Devices
- **Alliteration**: Repetition of consonant sounds ("silly snake")
- **Assonance**: Repetition of vowel sounds ("fleet feet sweep")
- **Onomatopoeia**: Words that sound like their meaning ("buzz", "crash")

### Other Techniques
- **Hyperbole**: Deliberate exaggeration
- **Oxymoron**: Contradictory terms ("deafening silence")
- **Symbolism**: Objects/ideas representing something else

## Structure

### Stanzas
- Groups of lines (like paragraphs in prose)
- **Couplet**: 2 lines
- **Quatrain**: 4 lines

### Rhythm and Meter
- Pattern of stressed and unstressed syllables
- Creates musical quality

### Rhyme Scheme
- Pattern of rhyming words
- Labeled with letters (ABAB, AABB, etc.)

## Form

### Sonnet
- 14 lines, specific rhyme scheme
- Often about love

### Ballad
- Narrative poem
- Often has refrain (repeated lines)

## How to Analyse

1. **Read** the poem several times
2. **Identify** language techniques
3. **Consider** structure and form
4. **Explore** themes and meanings
5. **Link** techniques to effects',
'English Literature', 'Poetry', '9', ARRAY['poetry', 'analysis', 'techniques', 'imagery']),

('Writing Persuasive Texts', 
'# Writing Persuasive Texts

Persuasive writing aims to convince the reader to agree with your viewpoint.

## Structure

### Introduction
- **Hook**: Grab attention (question, statistic, bold statement)
- **Thesis**: Clear statement of your position
- **Preview**: Outline your main arguments

### Body Paragraphs
- **One main point per paragraph**
- **Topic sentence**: States the point
- **Evidence**: Examples, facts, statistics
- **Explanation**: How evidence supports your point
- **Link**: Connect to next paragraph or conclusion

### Conclusion
- **Summarise** main arguments
- **Restate** thesis in different words
- **Call to action**: What should reader do?

## Persuasive Techniques

### Ethos (Credibility)
- Show you are knowledgeable
- Use expert opinions
- Show you understand counter-arguments

### Pathos (Emotion)
- Appeal to reader''s emotions
- Use emotive language
- Tell personal stories

### Logos (Logic)
- Use facts and statistics
- Logical reasoning
- Cause and effect arguments

## Language Choices

### Emotive Language
Words that trigger emotional responses:
- "Devastating" instead of "bad"
- "Tragic" instead of "sad"

### Rhetorical Questions
Questions that don''t need answers (make reader think):
- "How can we stand by and do nothing?"

### Repetition
Repeating key words/phrases for emphasis

### Triples (Rule of Three)
Three related points or examples',
'English Language', 'Writing', '9', ARRAY['persuasive writing', 'rhetoric', 'argument', 'techniques']),

('Shakespearean Language', 
'# Shakespearean Language

Understanding Shakespeare requires knowledge of his language and techniques.

## Common Words

### Archaic Language
- **Thou/Thee/Thy**: You/Your
- **Hath/Has**: Has
- **Doth/Does**: Does
- **Art**: Are
- **Hast**: Have
- **Wherefore**: Why (not where!)

## Verse Forms

### Blank Verse
- Unrhymed iambic pentameter
- Most of Shakespeare''s plays
- **Iambic pentameter**: 10 syllables per line, unstressed-stressed pattern

### Prose
- Ordinary speech (no meter)
- Used for lower-class characters or comic scenes

### Rhymed Verse
- Used for special moments (end of scenes, songs)

## Literary Techniques

### Soliloquy
- Character speaks thoughts aloud (alone on stage)
- Reveals inner thoughts and motivations

### Aside
- Character speaks directly to audience
- Other characters don''t hear

### Dramatic Irony
- Audience knows something characters don''t
- Creates tension and suspense

### Foreshadowing
- Hints about future events
- Builds anticipation

## Themes

Common themes in Shakespeare:
- **Love and relationships**
- **Power and ambition**
- **Jealousy and betrayal**
- **Appearance vs reality**
- **Fate vs free will**',
'English Literature', 'Shakespeare', '9', ARRAY['Shakespeare', 'iambic pentameter', 'soliloquy', 'themes']),

('Analysing Prose Fiction', 
'# Analysing Prose Fiction

Prose fiction analysis examines how writers create meaning through language and structure.

## Narrative Techniques

### Point of View
- **First person**: "I" - intimate, limited perspective
- **Third person limited**: Follows one character''s thoughts
- **Third person omniscient**: Knows all characters'' thoughts

### Narrative Voice
- **Tone**: Writer''s attitude (serious, humorous, sarcastic)
- **Register**: Level of formality

### Time and Structure
- **Chronological**: Events in order
- **Flashback**: Past events
- **Foreshadowing**: Hints about future

## Characterisation

### Direct Characterisation
Author directly tells us about character

### Indirect Characterisation
We learn through:
- **Actions**: What they do
- **Dialogue**: What they say
- **Thoughts**: What they think
- **Appearance**: How they look
- **Others'' reactions**: How others see them

## Setting

- **Time**: When story takes place
- **Place**: Where story takes place
- **Atmosphere**: Mood created
- **Function**: How setting affects plot/characters

## Themes

- **Main ideas** the text explores
- Often universal (love, loss, identity, power)
- Look for **recurring ideas** and **symbols**',
'English Literature', 'Prose', '9', ARRAY['prose', 'narrative', 'characterisation', 'setting', 'themes']),

('Language Analysis', 
'# Language Analysis

Language analysis examines how writers use language to create effects.

## Word Choice (Diction)

### Denotation vs Connotation
- **Denotation**: Literal meaning
- **Connotation**: Associated meanings/feelings
- Example: "House" (denotation) vs "Home" (connotation of warmth)

### Semantic Fields
Groups of related words that create a particular atmosphere

## Sentence Structure

### Simple Sentences
- One main clause
- Creates clarity, emphasis

### Compound Sentences
- Two main clauses joined
- Shows relationships

### Complex Sentences
- Main clause + subordinate clause
- Shows hierarchy of ideas

### Sentence Length
- **Short**: Impact, tension, clarity
- **Long**: Complexity, flow, description

## Literary Devices

### Alliteration
Repetition of consonant sounds for effect

### Assonance
Repetition of vowel sounds

### Metaphor/Simile
Comparisons that create vivid images

### Personification
Giving human qualities to non-human things

### Pathetic Fallacy
Weather/nature reflecting emotions

## How to Analyse

1. **Identify** the technique
2. **Quote** the example
3. **Explain** what it means
4. **Analyse** the effect on reader
5. **Link** to writer''s purpose',
'English Language', 'Language Analysis', '9', ARRAY['language', 'analysis', 'techniques', 'diction']),

-- =====================
-- GEOGRAPHY (3 notes)
-- =====================

('Tectonic Hazards', 
'# Tectonic Hazards

Tectonic hazards are caused by movements of Earth''s crust.

## Plate Boundaries

### Destructive (Convergent)
- Plates move **towards each other**
- Oceanic plate subducts under continental
- Forms: **Volcanoes**, **earthquakes**, **fold mountains**

### Constructive (Divergent)
- Plates move **apart**
- Magma rises, forms new crust
- Forms: **Volcanoes**, **earthquakes**, **mid-ocean ridges**

### Conservative (Transform)
- Plates **slide past** each other
- Forms: **Earthquakes** (no volcanoes)

## Earthquakes

### Causes
- Sudden movement along fault lines
- Release of built-up pressure

### Effects
- **Primary**: Ground shaking, building collapse
- **Secondary**: Tsunamis, landslides, fires

### Measuring
- **Richter Scale**: Measures magnitude (energy released)
- **Mercalli Scale**: Measures intensity (damage caused)

## Volcanoes

### Types
- **Composite**: Steep, explosive eruptions
- **Shield**: Gentle slopes, frequent eruptions

### Hazards
- Lava flows
- Pyroclastic flows
- Ash clouds
- Lahars (mudflows)

## Management

**MPPP Strategy**:
- **Monitoring**: Watch for warning signs
- **Prediction**: Forecast when might occur
- **Protection**: Build resistant structures
- **Planning**: Emergency procedures',
'Geography', 'Tectonic Hazards', '9', ARRAY['tectonic', 'earthquakes', 'volcanoes', 'plate boundaries']),

('Climate Change', 
'# Climate Change

Climate change refers to long-term changes in global weather patterns.

## Causes

### Natural Factors
- Changes in Earth''s orbit
- Volcanic activity
- Solar variation

### Human Factors (Enhanced Greenhouse Effect)
- **Burning fossil fuels**: Releases CO₂
- **Deforestation**: Reduces CO₂ absorption
- **Agriculture**: Methane from livestock
- **Industrial processes**: Various greenhouse gases

## Effects

### Environmental
- **Rising sea levels**: Melting ice caps
- **Extreme weather**: More frequent storms, droughts, floods
- **Ecosystem changes**: Species migration, extinction
- **Ocean acidification**: CO₂ dissolves in oceans

### Social
- **Displacement**: People forced to move
- **Food security**: Crop failures
- **Health**: Heat-related illnesses, disease spread
- **Economic**: Damage to infrastructure, agriculture

## Responses

### Mitigation (Reducing Causes)
- Use renewable energy
- Reduce deforestation
- Improve energy efficiency
- Carbon capture technology

### Adaptation (Coping with Effects)
- Build sea defences
- Develop drought-resistant crops
- Improve early warning systems
- Relocate vulnerable communities',
'Geography', 'Climate Change', '9', ARRAY['climate change', 'greenhouse effect', 'global warming']),

('Urbanisation and Development', 
'# Urbanisation and Development

Urbanisation is the growth of cities and urban areas.

## Causes

### Push Factors (Rural to Urban)
- Lack of jobs
- Poor living conditions
- Natural disasters
- Conflict

### Pull Factors (Attractions of Cities)
- Job opportunities
- Better services (health, education)
- Higher wages
- Entertainment and culture

## Effects

### Positive
- Economic growth
- Better access to services
- Cultural diversity
- Innovation

### Negative
- **Overcrowding**: High population density
- **Slums**: Informal settlements, poor housing
- **Traffic congestion**: Air pollution
- **Strain on services**: Schools, hospitals overwhelmed
- **Crime**: Higher rates in some areas

## Megacities

Cities with **over 10 million** inhabitants.

Examples: Tokyo, Delhi, Shanghai, São Paulo

### Challenges
- Providing housing
- Managing waste
- Ensuring water supply
- Transport systems

## Sustainable Development

Meeting current needs without compromising future generations.

### Strategies
- **Green spaces**: Parks and gardens
- **Public transport**: Reduce car use
- **Renewable energy**: Solar, wind power
- **Waste management**: Recycling, composting
- **Affordable housing**: Prevent slums',
'Geography', 'Urban Issues', '9', ARRAY['urbanisation', 'development', 'megacities', 'sustainability']),

-- =====================
-- HISTORY (2 notes)
-- =====================

('The Cold War', 
'# The Cold War

The Cold War (1945-1991) was a period of tension between USA and USSR without direct fighting.

## Origins

### End of WWII
- USA and USSR emerged as superpowers
- Different ideologies:
  - **USA**: Capitalism, democracy
  - **USSR**: Communism, one-party state

### Key Events
- **1945**: Yalta and Potsdam Conferences (divide Germany)
- **1947**: Truman Doctrine (USA supports countries against communism)
- **1948-49**: Berlin Blockade and Airlift
- **1949**: NATO formed (Western military alliance)

## Major Conflicts

### Korean War (1950-53)
- North (communist) vs South (capitalist)
- USA supported South, USSR/China supported North
- Ended in stalemate, Korea still divided

### Vietnam War (1955-75)
- USA tried to prevent communist takeover
- Long, costly war
- USA withdrew, Vietnam unified under communism

### Cuban Missile Crisis (1962)
- USSR placed nuclear missiles in Cuba
- 13 days of tension
- Closest to nuclear war
- Resolved through negotiation

## End of Cold War

### Factors
- **Gorbachev''s reforms**: Glasnost (openness) and Perestroika (restructuring)
- **Economic problems**: USSR couldn''t compete
- **Revolutions**: Eastern European countries broke free
- **1989**: Berlin Wall fell
- **1991**: USSR dissolved',
'History', 'Cold War', '9', ARRAY['Cold War', 'USA', 'USSR', 'communism', 'capitalism']),

('World War II', 
'# World War II

World War II (1939-1945) was the deadliest conflict in human history.

## Causes

### Long-term
- **Treaty of Versailles**: Harsh terms on Germany after WWI
- **Rise of dictators**: Hitler (Germany), Mussolini (Italy), Tojo (Japan)
- **Appeasement**: Allies tried to avoid war by giving in to demands
- **Failure of League of Nations**: Couldn''t prevent aggression

### Immediate
- **1939**: Germany invaded Poland
- Britain and France declared war

## Key Events

### Early War (1939-41)
- **Blitzkrieg**: German lightning war tactics
- **1940**: Fall of France, Battle of Britain
- **1941**: Operation Barbarossa (Germany invades USSR)

### Turning Points
- **1941**: USA enters war (Pearl Harbor)
- **1942-43**: Battle of Stalingrad (USSR defeats Germany)
- **1944**: D-Day (Allied invasion of France)
- **1945**: Atomic bombs on Japan (Hiroshima, Nagasaki)

## The Holocaust

Systematic murder of 6 million Jews and millions of others by Nazi Germany.

- **Ghettos**: Isolated Jewish areas
- **Concentration camps**: Forced labour
- **Extermination camps**: Mass murder
- **Final Solution**: Plan to kill all European Jews

## Consequences

- **Casualties**: 70-85 million deaths
- **Destruction**: Cities, infrastructure destroyed
- **Cold War**: USA vs USSR tensions begin
- **Decolonisation**: European empires weakened
- **United Nations**: Formed to prevent future wars',
'History', 'World War II', '9', ARRAY['World War II', 'Hitler', 'Holocaust', 'D-Day']);

-- ============================================
-- Total: 50 Premium Grade 9 Notes
-- ============================================
-- Mathematics: 10 notes
-- Biology: 10 notes
-- Chemistry: 10 notes
-- Physics: 10 notes
-- English: 5 notes
-- Geography: 3 notes
-- History: 2 notes
-- ============================================
