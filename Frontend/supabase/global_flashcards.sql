-- ============================================
-- Global Flashcards - Pre-populated Study Cards
-- Based on Knowledge Organizer Content
-- ============================================

-- 1. Create Global Flashcards Table
CREATE TABLE IF NOT EXISTS public.global_flashcards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  subject TEXT,
  topic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.global_flashcards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read access for global flashcards" ON public.global_flashcards;

CREATE POLICY "Public read access for global flashcards"
  ON public.global_flashcards FOR SELECT
  USING (true);

-- ============================================
-- 2. Update User Seeding Function
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );

  -- Seed Past Papers
  INSERT INTO public.past_papers (user_id, title, subject, year, exam_board, file_url, file_type)
  SELECT 
    NEW.id, 
    title, 
    subject, 
    year, 
    exam_board, 
    file_url, 
    file_type
  FROM public.global_past_papers;

  -- Seed Knowledge Organizers
  INSERT INTO public.knowledge_organizers (user_id, title, subject, topic, content)
  SELECT 
    NEW.id, 
    title, 
    subject, 
    topic, 
    content
  FROM public.global_knowledge_organizers;

  -- Seed Flashcards
  INSERT INTO public.flashcards (user_id, front, back, subject, topic, difficulty, review_count)
  SELECT 
    NEW.id, 
    front, 
    back, 
    subject, 
    topic,
    1,
    0
  FROM public.global_flashcards;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. Flashcard Starter Pack
-- Based on Knowledge Organizer Content
-- ============================================
TRUNCATE TABLE public.global_flashcards;

INSERT INTO public.global_flashcards (front, back, subject, topic) VALUES
-- =====================
-- BIOLOGY: Cell Biology
-- =====================
('What is the function of the nucleus?', 'Contains genetic material (DNA) and controls cell activities', 'Biology', 'Cell Biology'),
('What is the function of mitochondria?', 'Site of aerobic respiration - produces ATP energy for the cell', 'Biology', 'Cell Biology'),
('What is the function of ribosomes?', 'Site of protein synthesis', 'Biology', 'Cell Biology'),
('What is the function of the cell membrane?', 'Controls what enters and leaves the cell (selectively permeable)', 'Biology', 'Cell Biology'),
('Name three structures found in plant cells but NOT in animal cells', 'Cell wall, chloroplasts, and permanent vacuole', 'Biology', 'Cell Biology'),
('What is the function of chloroplasts?', 'Site of photosynthesis - converts light energy into glucose', 'Biology', 'Cell Biology'),
('What is the formula for magnification?', 'Magnification = Image Size ÷ Real Size', 'Biology', 'Cell Biology'),
('What is the difference between eukaryotic and prokaryotic cells?', 'Eukaryotic cells have a nucleus and membrane-bound organelles; prokaryotic cells (bacteria) do not', 'Biology', 'Cell Biology'),

-- =====================
-- BIOLOGY: Infection & Response
-- =====================
('What are the four types of pathogens?', 'Viruses, bacteria, fungi, and protists', 'Biology', 'Infection'),
('How do viruses cause disease?', 'They live inside cells and reproduce, eventually destroying the host cell', 'Biology', 'Infection'),
('How do bacteria cause disease?', 'They produce toxins that damage tissues and cells', 'Biology', 'Infection'),
('What is phagocytosis?', 'White blood cells engulfing and digesting pathogens', 'Biology', 'Infection'),
('What are antibodies?', 'Proteins produced by white blood cells that target specific pathogens', 'Biology', 'Infection'),
('How do vaccinations work?', 'They contain weakened or dead pathogens that trigger immune response without causing disease, creating memory cells', 'Biology', 'Infection'),

-- =====================
-- CHEMISTRY: Atomic Structure
-- =====================
('What are the three subatomic particles?', 'Protons (positive), neutrons (neutral), and electrons (negative)', 'Chemistry', 'Atomic Structure'),
('What is the atomic number?', 'The number of protons in an atom (also equals electrons in a neutral atom)', 'Chemistry', 'Atomic Structure'),
('What is the mass number?', 'The total number of protons + neutrons in an atom', 'Chemistry', 'Atomic Structure'),
('What are isotopes?', 'Atoms of the same element with the same number of protons but different numbers of neutrons', 'Chemistry', 'Atomic Structure'),
('How many electrons fit in the first shell?', '2 electrons', 'Chemistry', 'Atomic Structure'),
('How many electrons fit in the second and third shells?', 'Up to 8 electrons each', 'Chemistry', 'Atomic Structure'),
('What does the group number tell us in the periodic table?', 'The number of electrons in the outer shell', 'Chemistry', 'Atomic Structure'),
('What does the period number tell us in the periodic table?', 'The number of electron shells', 'Chemistry', 'Atomic Structure'),

-- =====================
-- CHEMISTRY: Chemical Bonding
-- =====================
('What is ionic bonding?', 'Transfer of electrons from a metal to a non-metal, forming positive and negative ions that attract', 'Chemistry', 'Chemical Bonding'),
('What is covalent bonding?', 'Sharing of electron pairs between non-metal atoms', 'Chemistry', 'Chemical Bonding'),
('What is metallic bonding?', 'A lattice of positive metal ions surrounded by a sea of delocalised electrons', 'Chemistry', 'Chemical Bonding'),
('Why do ionic compounds have high melting points?', 'Strong electrostatic forces between positive and negative ions require lots of energy to overcome', 'Chemistry', 'Chemical Bonding'),
('When can ionic compounds conduct electricity?', 'When molten or dissolved in water (ions are free to move)', 'Chemistry', 'Chemical Bonding'),
('Give an example of a giant covalent structure', 'Diamond, graphite, or silicon dioxide', 'Chemistry', 'Chemical Bonding'),

-- =====================
-- PHYSICS: Energy
-- =====================
('Name five energy stores', 'Kinetic, thermal, chemical, gravitational potential, and elastic potential', 'Physics', 'Energy'),
('What is the formula for power?', 'Power (W) = Energy (J) ÷ Time (s)', 'Physics', 'Energy'),
('What is the formula for efficiency?', 'Efficiency = Useful Output Energy ÷ Total Input Energy', 'Physics', 'Energy'),
('What is the law of conservation of energy?', 'Energy cannot be created or destroyed, only transferred between stores', 'Physics', 'Energy'),
('What type of energy store does a moving object have?', 'Kinetic energy store', 'Physics', 'Energy'),
('Where is energy "wasted" in most energy transfers?', 'Transferred to thermal energy in the surroundings (heat)', 'Physics', 'Energy'),

-- =====================
-- PHYSICS: Electricity
-- =====================
('What is Ohm''s Law?', 'V = I × R (Voltage = Current × Resistance)', 'Physics', 'Electricity'),
('In a series circuit, what happens to current?', 'Current is the same at all points in the circuit', 'Physics', 'Electricity'),
('In a parallel circuit, what happens to voltage?', 'Voltage is the same across each branch', 'Physics', 'Electricity'),
('What colour is the live wire in a UK plug?', 'Brown', 'Physics', 'Electricity'),
('What colour is the neutral wire in a UK plug?', 'Blue', 'Physics', 'Electricity'),
('What colour is the earth wire in a UK plug?', 'Green and yellow striped', 'Physics', 'Electricity'),
('What is the voltage of UK mains electricity?', '230V AC (alternating current)', 'Physics', 'Electricity'),

-- =====================
-- MATHEMATICS: Geometry
-- =====================
('State Pythagoras'' Theorem', 'a² + b² = c² where c is the hypotenuse', 'Mathematics', 'Geometry'),
('What does SOH CAH TOA stand for?', 'Sin = Opposite/Hypotenuse, Cos = Adjacent/Hypotenuse, Tan = Opposite/Adjacent', 'Mathematics', 'Geometry'),
('When do you use the sine rule?', 'When you have a pair of opposite angle and side', 'Mathematics', 'Geometry'),
('When do you use the cosine rule?', 'When you have three sides or two sides and the included angle', 'Mathematics', 'Geometry'),

-- =====================
-- MATHEMATICS: Algebra
-- =====================
('What is the equation of a straight line?', 'y = mx + c where m is the gradient and c is the y-intercept', 'Mathematics', 'Algebra'),
('What is the quadratic formula?', 'x = (-b ± √(b²-4ac)) / 2a', 'Mathematics', 'Algebra'),
('How do you find the nth term of an arithmetic sequence?', 'nth term = a + (n-1)d where a is first term and d is common difference', 'Mathematics', 'Algebra'),
('What does the discriminant tell us?', 'b²-4ac: if positive = 2 roots, if zero = 1 root, if negative = no real roots', 'Mathematics', 'Algebra'),

-- =====================
-- ENGLISH: Literary Devices
-- =====================
('What is a simile?', 'A comparison using "like" or "as" (e.g., "as brave as a lion")', 'English Language', 'Techniques'),
('What is a metaphor?', 'Saying something IS something else (e.g., "life is a journey")', 'English Language', 'Techniques'),
('What is personification?', 'Giving human characteristics to non-human things', 'English Language', 'Techniques'),
('What is juxtaposition?', 'Placing two contrasting ideas close together for effect', 'English Language', 'Techniques'),
('What is hyperbole?', 'Deliberate exaggeration for emphasis or effect', 'English Language', 'Techniques'),
('What is anaphora?', 'Repetition of a word or phrase at the start of successive sentences', 'English Language', 'Techniques'),

-- =====================
-- HISTORY: Medicine Through Time
-- =====================
('What was the Theory of the Four Humours?', 'Ancient belief that the body contained blood, phlegm, yellow bile, and black bile that needed to be balanced', 'History', 'Health and the People'),
('Who developed Germ Theory and when?', 'Louis Pasteur in 1861', 'History', 'Health and the People'),
('Who discovered penicillin?', 'Alexander Fleming in 1928', 'History', 'Health and the People'),
('Who developed the first successful smallpox vaccine?', 'Edward Jenner in 1796', 'History', 'Health and the People'),
('When was the NHS established?', '1948, by Aneurin Bevan', 'History', 'Health and the People'),

-- =====================
-- HISTORY: Nazi Germany
-- =====================
('What was the Treaty of Versailles'' Article 231?', 'The War Guilt Clause - Germany had to accept blame for WWI', 'History', 'Germany'),
('What was the Reichstag Fire and why was it significant?', 'February 1933 - The German parliament was set on fire, allowing Hitler to pass the Enabling Act', 'History', 'Germany'),
('What was the Enabling Act?', 'Law that allowed Hitler to pass laws without the Reichstag, effectively making him a dictator', 'History', 'Germany'),
('Who was Joseph Goebbels?', 'Nazi Minister of Propaganda who controlled media and public perception', 'History', 'Germany'),

-- =====================
-- GEOGRAPHY: Tectonic Hazards
-- =====================
('What happens at a destructive plate margin?', 'Plates move towards each other; oceanic plate subducts under continental plate, causing earthquakes and volcanoes', 'Geography', 'Tectonic Hazards'),
('What happens at a constructive plate margin?', 'Plates move apart, magma rises to form new crust, creating volcanoes and earthquakes', 'Geography', 'Tectonic Hazards'),
('What happens at a conservative plate margin?', 'Plates slide past each other, causing powerful earthquakes (no volcanoes)', 'Geography', 'Tectonic Hazards'),
('What does MPPP stand for in hazard management?', 'Monitoring, Prediction, Protection, Planning', 'Geography', 'Tectonic Hazards'),

-- =====================
-- GEOGRAPHY: Ecosystems
-- =====================
('Why do tropical rainforests have high biodiversity?', 'Warm temperatures, high rainfall, and rapid nutrient cycling support many species', 'Geography', 'The Living World'),
('What is selective logging?', 'Only cutting down mature trees, allowing forest to regenerate', 'Geography', 'The Living World'),
('What is a debt-for-nature swap?', 'Countries have debt reduced in exchange for protecting rainforest areas', 'Geography', 'The Living World'),

-- =====================
-- COMPUTER SCIENCE: System Architecture
-- =====================
('What does CPU stand for?', 'Central Processing Unit', 'Computer Science', 'System Architecture'),
('What are the three main components of the CPU?', 'ALU (Arithmetic Logic Unit), CU (Control Unit), and Registers', 'Computer Science', 'System Architecture'),
('What is the Fetch-Decode-Execute cycle?', 'The process where CPU fetches instructions from memory, decodes them, and executes them', 'Computer Science', 'System Architecture'),
('What is Von Neumann architecture?', 'Computer architecture where program instructions and data share the same memory', 'Computer Science', 'System Architecture'),
('What do the registers PC, MAR, and MDR stand for?', 'Program Counter, Memory Address Register, Memory Data Register', 'Computer Science', 'System Architecture'),

-- =====================
-- COMPUTER SCIENCE: Network Security
-- =====================
('What is phishing?', 'Deceptive emails or websites designed to trick users into revealing personal information', 'Computer Science', 'Network Security'),
('What is a brute force attack?', 'Trying every possible password combination until the correct one is found', 'Computer Science', 'Network Security'),
('What is SQL injection?', 'Inserting malicious SQL code into web forms to access or manipulate databases', 'Computer Science', 'Network Security'),
('What is encryption?', 'Converting data into a coded format that can only be read with the correct key', 'Computer Science', 'Network Security'),
('What does a firewall do?', 'Monitors and controls incoming and outgoing network traffic based on security rules', 'Computer Science', 'Network Security'),

-- =====================
-- ENGLISH LITERATURE: An Inspector Calls
-- =====================
('Who wrote An Inspector Calls?', 'J.B. Priestley', 'English Literature', 'Modern Drama'),
('What is the main theme of An Inspector Calls?', 'Social responsibility - "We are members of one body"', 'English Literature', 'Modern Drama'),
('Who represents capitalism in An Inspector Calls?', 'Arthur Birling - he prioritizes profit over workers'' welfare', 'English Literature', 'Modern Drama'),
('Which character changes the most in An Inspector Calls?', 'Sheila Birling - she accepts responsibility and wants to change', 'English Literature', 'Modern Drama'),

-- =====================
-- ENGLISH LITERATURE: Macbeth
-- =====================
('What is Macbeth''s tragic flaw (hamartia)?', 'Vaulting ambition - his desire for power leads to his downfall', 'English Literature', 'Shakespeare'),
('What do the witches represent in Macbeth?', 'The supernatural, fate, and moral ambiguity ("Fair is foul and foul is fair")', 'English Literature', 'Shakespeare'),
('What is the significance of the Divine Right of Kings in Macbeth?', 'Killing a king was considered a sin against God and nature, making Duncan''s murder even more heinous', 'English Literature', 'Shakespeare'),
('What does Banquo''s ghost symbolize?', 'Macbeth''s guilt and paranoia after murdering his friend', 'English Literature', 'Shakespeare'),

-- =====================
-- BUSINESS
-- =====================
('What is unlimited liability?', 'The owner is personally responsible for all business debts', 'Business', 'Business Activity'),
('What is limited liability?', 'The owner''s personal assets are protected from business debts', 'Business', 'Business Activity'),
('What are the 4 Ps of the marketing mix?', 'Product, Price, Place, and Promotion', 'Business', 'Business Activity'),
('What is penetration pricing?', 'Setting a low initial price to attract customers and gain market share', 'Business', 'Business Activity'),
('What is price skimming?', 'Setting a high initial price for a new product, then lowering it over time', 'Business', 'Business Activity'),

-- =====================
-- ADDITIONAL FLASHCARDS - More Topics
-- =====================
-- BIOLOGY: Homeostasis
('What is homeostasis?', 'The maintenance of a constant internal environment', 'Biology', 'Homeostasis'),
('What is negative feedback?', 'A mechanism that reverses a change in conditions to maintain stability', 'Biology', 'Homeostasis'),
('What hormone controls blood glucose levels?', 'Insulin (lowers) and Glucagon (raises)', 'Biology', 'Homeostasis'),
('What is the role of the pancreas in blood glucose control?', 'Produces insulin and glucagon to regulate blood sugar', 'Biology', 'Homeostasis'),
('What is Type 1 diabetes?', 'A condition where the pancreas produces little or no insulin', 'Biology', 'Homeostasis'),
('What is Type 2 diabetes?', 'A condition where the body becomes resistant to insulin', 'Biology', 'Homeostasis'),

-- BIOLOGY: Inheritance
('What is a gene?', 'A section of DNA that codes for a specific protein', 'Biology', 'Inheritance'),
('What is an allele?', 'A different version of the same gene', 'Biology', 'Inheritance'),
('What is a dominant allele?', 'An allele that is always expressed if present', 'Biology', 'Inheritance'),
('What is a recessive allele?', 'An allele that is only shows if both copies are present', 'Biology', 'Inheritance'),
('What is a genotype?', 'The genetic makeup of an organism (e.g., BB, Bb, bb)', 'Biology', 'Inheritance'),
('What is a phenotype?', 'The physical characteristics of an organism', 'Biology', 'Inheritance'),
('What is homozygous?', 'Having two identical alleles (e.g., BB or bb)', 'Biology', 'Inheritance'),
('What is heterozygous?', 'Having two different alleles (e.g., Bb)', 'Biology', 'Inheritance'),

-- CHEMISTRY: Rates of Reaction
('What are the four factors that affect rate of reaction?', 'Temperature, concentration, surface area, and catalysts', 'Chemistry', 'Rates of Reaction'),
('How does temperature affect reaction rate?', 'Higher temperature increases particle energy and collision frequency', 'Chemistry', 'Rates of Reaction'),
('How does concentration affect reaction rate?', 'Higher concentration means more particles per unit volume, more collisions', 'Chemistry', 'Rates of Reaction'),
('What is a catalyst?', 'A substance that speeds up a reaction without being used up', 'Chemistry', 'Rates of Reaction'),
('How does surface area affect reaction rate?', 'Larger surface area provides more area for collisions to occur', 'Chemistry', 'Rates of Reaction'),

-- CHEMISTRY: Acids and Bases
('What is the pH scale?', 'A scale from 0-14 measuring acidity/alkalinity (7 is neutral)', 'Chemistry', 'Acids and Bases'),
('What is an acid?', 'A substance with pH less than 7 that releases H+ ions', 'Chemistry', 'Acids and Bases'),
('What is a base?', 'A substance with pH greater than 7 that releases OH- ions', 'Chemistry', 'Acids and Bases'),
('What is neutralization?', 'The reaction between an acid and a base to form salt and water', 'Chemistry', 'Acids and Bases'),
('What is the general equation for neutralization?', 'Acid + Base → Salt + Water', 'Chemistry', 'Acids and Bases'),

-- PHYSICS: Forces
('What is Newton''s First Law?', 'An object at rest stays at rest, an object in motion stays in motion unless acted upon by a force', 'Physics', 'Forces'),
('What is Newton''s Second Law?', 'F = ma (Force = mass × acceleration)', 'Physics', 'Forces'),
('What is Newton''s Third Law?', 'For every action there is an equal and opposite reaction', 'Physics', 'Forces'),
('What is weight?', 'The force of gravity acting on an object (W = mg)', 'Physics', 'Forces'),
('What is the difference between mass and weight?', 'Mass is the amount of matter (kg), weight is the force of gravity (N)', 'Physics', 'Forces'),
('What is friction?', 'A force that opposes motion between two surfaces in contact', 'Physics', 'Forces'),

-- PHYSICS: Motion
('What is velocity?', 'Speed in a given direction (vector quantity)', 'Physics', 'Motion'),
('What is acceleration?', 'The rate of change of velocity (a = Δv/Δt)', 'Physics', 'Motion'),
('What is the equation for distance?', 'Distance = Speed × Time (s = vt)', 'Physics', 'Motion'),
('What is the equation for acceleration?', 'Acceleration = Change in Velocity / Time (a = (v-u)/t)', 'Physics', 'Motion'),

-- MATHEMATICS: Number
('What is a prime number?', 'A number greater than 1 that has only two factors: 1 and itself', 'Mathematics', 'Number'),
('What is the highest common factor (HCF)?', 'The largest number that divides into two or more numbers', 'Mathematics', 'Number'),
('What is the lowest common multiple (LCM)?', 'The smallest number that is a multiple of two or more numbers', 'Mathematics', 'Number'),
('What is a square number?', 'A number multiplied by itself (e.g., 4 = 2²)', 'Mathematics', 'Number'),
('What is a cube number?', 'A number multiplied by itself three times (e.g., 8 = 2³)', 'Mathematics', 'Number'),

-- MATHEMATICS: Ratio and Proportion
('How do you simplify a ratio?', 'Divide both parts by their highest common factor', 'Mathematics', 'Ratio'),
('What is direct proportion?', 'When one quantity increases, the other increases by the same factor (y = kx)', 'Mathematics', 'Ratio'),
('What is inverse proportion?', 'When one quantity increases, the other decreases (y = k/x)', 'Mathematics', 'Ratio'),
('How do you share an amount in a given ratio?', 'Add the ratio parts, divide the amount by the total, multiply each part', 'Mathematics', 'Ratio'),

-- ENGLISH: Language Analysis
('What is alliteration?', 'Repetition of consonant sounds at the start of words', 'English Language', 'Language Analysis'),
('What is assonance?', 'Repetition of vowel sounds within words', 'English Language', 'Language Analysis'),
('What is sibilance?', 'Repetition of ''s'' sounds for effect', 'English Language', 'Language Analysis'),
('What is a semantic field?', 'A group of words related in meaning', 'English Language', 'Language Analysis'),
('What is pathetic fallacy?', 'Attributing human emotions to nature or inanimate objects', 'English Language', 'Language Analysis'),

-- ENGLISH LITERATURE: Romeo and Juliet
('Who wrote Romeo and Juliet?', 'William Shakespeare', 'English Literature', 'Shakespeare'),
('What is the main theme of Romeo and Juliet?', 'The destructive power of love and family feuds', 'English Literature', 'Shakespeare'),
('What is a tragic flaw in Romeo?', 'His impulsive nature and passionate love', 'English Literature', 'Shakespeare'),
('What role does Friar Laurence play?', 'He marries the lovers and provides the potion plan', 'English Literature', 'Shakespeare'),

-- GEOGRAPHY: Urban Issues
('What is urbanisation?', 'The growth of cities and urban areas', 'Geography', 'Urban Issues'),
('What is a megacity?', 'A city with over 10 million inhabitants', 'Geography', 'Urban Issues'),
('What are push factors?', 'Reasons people leave rural areas (e.g., lack of jobs)', 'Geography', 'Urban Issues'),
('What are pull factors?', 'Reasons people move to cities (e.g., better opportunities)', 'Geography', 'Urban Issues'),
('What is urban sprawl?', 'The uncontrolled expansion of urban areas into surrounding countryside', 'Geography', 'Urban Issues'),

-- HISTORY: Norman Conquest
('When did the Battle of Hastings occur?', '14th October 1066', 'History', 'Norman Conquest'),
('Who won the Battle of Hastings?', 'William the Conqueror (Duke of Normandy)', 'History', 'Norman Conquest'),
('What was the Domesday Book?', 'A survey of all land and property in England (1086)', 'History', 'Norman Conquest'),
('What was the Feudal System?', 'A hierarchical system where the king granted land to barons in exchange for loyalty', 'History', 'Norman Conquest'),

-- COMPUTER SCIENCE: Programming
('What is a variable?', 'A named storage location that holds a value', 'Computer Science', 'Programming'),
('What is an algorithm?', 'A step-by-step procedure to solve a problem', 'Computer Science', 'Programming'),
('What is a loop?', 'A programming construct that repeats code', 'Computer Science', 'Programming'),
('What is selection?', 'A programming construct that makes decisions (if/else)', 'Computer Science', 'Programming'),
('What is iteration?', 'Repeating a process or loop', 'Computer Science', 'Programming');

-- ============================================
-- 4. Backfill for Existing Users
-- ============================================
INSERT INTO public.flashcards (user_id, front, back, subject, topic, difficulty, review_count)
SELECT 
  p.id AS user_id,
  g.front,
  g.back,
  g.subject,
  g.topic,
  1,
  0
FROM public.profiles p
CROSS JOIN public.global_flashcards g
WHERE NOT EXISTS (
  SELECT 1 FROM public.flashcards f 
  WHERE f.user_id = p.id 
  AND f.front = g.front
  AND f.subject = g.subject
);
