-- ============================================
-- 1. Create Global Knowledge Organizers Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.global_knowledge_organizers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT,
  topic TEXT,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.global_knowledge_organizers ENABLE ROW LEVEL SECURITY;

-- Drop policy if it exists to avoid errors on re-run
DROP POLICY IF EXISTS "Public read access for global organizers" ON public.global_knowledge_organizers;

CREATE POLICY "Public read access for global organizers"
  ON public.global_knowledge_organizers FOR SELECT
  USING (true);

-- ============================================
-- 2. Update User Seeding Function
-- ============================================
-- This version handles both Past Papers and Knowledge Organizers
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 3. Essential Knowledge Starter Pack
-- ============================================
TRUNCATE TABLE public.global_knowledge_organizers;

-- BIOLOGY: Cell Biology
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Cell Biology & Organelles',
  'Biology',
  'Cell Biology',
  '{
    "sections": [
      {
        "title": "Cell Structure",
        "content": "All living things are made of cells. Eukaryotic cells (animal and plant) have a nucleus and membrane-bound organelles. Prokaryotic cells (bacteria) are smaller and have no nucleus.",
        "keyPoints": [
          "Nucleus: Contains genetic material",
          "Mitochondria: Site of aerobic respiration",
          "Ribosomes: Site of protein synthesis",
          "Cell Membrane: Controls what enters/leaves"
        ],
        "color": "primary"
      },
      {
        "title": "Plant vs Animal Cells",
        "content": "Plant cells have three extra features that animal cells lack: a vacuole, a cell wall, and chloroplasts.",
        "keyPoints": [
          "Chloroplasts: Site of photosynthesis",
          "Cell Wall: Made of cellulose for support",
          "Vacuole: Contains cell sap"
        ],
        "color": "secondary"
      },
      {
        "title": "Microscopy",
        "content": "Magnification is how many times bigger an image is than the real object. Resolution is the ability to distinguish between two points.",
        "keyPoints": [
          "Magnification = Image Size / Real Size",
          "Electron microscopes have higher resolution than light microscopes"
        ],
        "color": "accent"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- CHEMISTRY: Atomic Structure
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Atomic Structure & Periodic Table',
  'Chemistry',
  'Atomic Structure',
  '{
    "sections": [
      {
        "title": "The Atom",
        "content": "Atoms consist of a central nucleus (protons and neutrons) surrounded by electrons in shells.",
        "keyPoints": [
          "Proton: Mass 1, Charge +1",
          "Neutron: Mass 1, Charge 0",
          "Electron: Mass 0 (negligible), Charge -1",
          "Atomic Number = Number of Protons",
          "Mass Number = Protons + Neutrons"
        ],
        "color": "primary"
      },
      {
        "title": "Electronic Structure",
        "content": "Electrons occupy energy levels (shells). The first shell holds 2, subsequent shells hold up to 8.",
        "keyPoints": [
          "Group number = Electrons in outer shell",
          "Period number = Number of shells",
          "Noble gases (Group 0) have full outer shells"
        ],
        "color": "secondary"
      },
      {
        "title": "Isotopes",
        "content": "Isotopes are atoms of the same element with the same number of protons but different numbers of neutrons.",
        "keyPoints": [
          "Same atomic number, different mass number",
          "Chemically identical because they have the same electron configuration"
        ],
        "color": "accent"
      }
    ],
    "exam_board": "Edexcel"
  }'::jsonb
);

-- PHYSICS: Energy
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Energy Stores & Transfers',
  'Physics',
  'Energy',
  '{
    "sections": [
      {
        "title": "Energy Stores",
        "content": "Energy is never created or destroyed, only transferred between stores.",
        "keyPoints": [
          "Kinetic: Moving objects",
          "Thermal: Hot objects",
          "Chemical: Food, fuel, batteries",
          "Gravitational Potential: Objects at height",
          "Elastic Potential: Stretched objects"
        ],
        "color": "primary"
      },
      {
        "title": "Power & Efficiency",
        "content": "Power is the rate of energy transfer. Efficiency is the proportion of useful energy output.",
        "keyPoints": [
          "Power (W) = Energy (J) / Time (s)",
          "Efficiency = Useful Output / Total Input",
          "Energy is wasted as heat to surroundings"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- MATHS: Geometry basics
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Trigonometry & Pythagoras',
  'Mathematics',
  'Geometry',
  '{
    "sections": [
      {
        "title": "Pythagoras Theorem",
        "content": "In a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.",
        "keyPoints": [
          "a² + b² = c²",
          "c is always the longest side (hypotenuse)"
        ],
        "color": "primary"
      },
      {
        "title": "SOH CAH TOA",
        "content": "Trigonometric ratios relate the angles and sides of a right-angled triangle.",
        "keyPoints": [
          "Sin(θ) = Opposite / Hypotenuse",
          "Cos(θ) = Adjacent / Hypotenuse",
          "Tan(θ) = Opposite / Adjacent"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "OCR"
  }'::jsonb
);

-- ENGLISH: Literary Devices
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'GCSE Literary & Rhetorical Devices',
  'English Language',
  'Techniques',
  '{
    "sections": [
      {
        "title": "Imagery & Comparison",
        "content": "Authors use comparisons to create vivid pictures in the reader''s mind.",
        "keyPoints": [
          "Simile: Comparison using like or as",
          "Metaphor: Saying something IS something else",
          "Personification: Giving human traits to objects",
          "Onomatopoeia: Words that sound like their meaning"
        ],
        "color": "primary"
      },
      {
        "title": "Structure & Effect",
        "content": "How a text is organized influences the reader''s perception.",
        "keyPoints": [
          "Juxtaposition: Placing two opposites together for contrast",
          "Anaphora: Repetition of a word at the start of sentences",
          "Hyperbole: Deliberate exaggeration for effect"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "Eduqas/WJEC"
  }'::jsonb
);

-- ============================================
-- 4. HISTORY: MEDICINE & MODERN TIMES
-- ============================================
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Medicine Through Time: Progress & Change',
  'History',
  'Health and the People',
  '{
    "sections": [
      {
        "title": "Medieval Medicine",
        "content": "Dominated by the Theory of the Four Humours (blood, phlegm, yellow/black bile) and religious explanations. Treatments often involved bloodletting or prayer.",
        "keyPoints": [
          "Theory of the Four Humours: Galen and Hippocrates",
          "Church influence protected ancient theories",
          "Black Death (1348): Plague spread by fleas on rats"
        ],
        "color": "primary"
      },
      {
        "title": "Medical Revolution",
        "content": "19th-century progress driven by individuals and technology. Pasteur discovered Germ Theory in 1861.",
        "keyPoints": [
          "Louis Pasteur: Germ Theory (microbes cause disease)",
          "Robert Koch: Identified specific bacteria",
          "Alexander Fleming: Discovered Penicillin (1928)",
          "Edward Jenner: Developed Smallpox vaccine"
        ],
        "color": "secondary"
      },
      {
        "title": "Modern Medicine",
        "content": "The 20th century saw the creation of the NHS and advanced technology like X-rays and MRI scans.",
        "keyPoints": [
          "1948: Launch of the NHS (Aneurin Bevan)",
          "Crick and Watson: Mapped DNA structure (1953)",
          "Advancements in surgery: Transplants and keyhole"
        ],
        "color": "accent"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Weimar and Nazi Germany (1918-1939)',
  'History',
  'Germany',
  '{
    "sections": [
      {
        "title": "The Weimar Republic",
        "content": "Established after WWI, the republic faced immense economic and political pressure from the start.",
        "keyPoints": [
          "Treaty of Versailles: Article 231 (War Guilt Clause)",
          "1923 Crisis: Hyperinflation and Munich Putsch",
          "Golden Age (1924-29): Stresemann''s recovery"
        ],
        "color": "primary"
      },
      {
        "title": "Rise of the Nazis",
        "content": "The Great Depression (1929) allowed Hitler to gain mass support through propaganda and promises.",
        "keyPoints": [
          "Propaganda: Joseph Goebbels masterminded image",
          "Jan 1933: Hitler appointed Chancellor",
          "Reichstag Fire: Led to the Enabling Act"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "Edexcel"
  }'::jsonb
);

-- ============================================
-- 5. GEOGRAPHY: HAZARDS & ENVIRONMENT
-- ============================================
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Tectonic Hazards: Causes & Effects',
  'Geography',
  'Tectonic Hazards',
  '{
    "sections": [
      {
        "title": "Plate Margins",
        "content": "Hazards occur at different margins due to the movement of tectonic plates.",
        "keyPoints": [
          "Destructive: Plates move towards each other (subduction)",
          "Constructive: Plates move apart (new crust)",
          "Conservative: Plates slide past (powerful earthquakes)"
        ],
        "color": "primary"
      },
      {
        "title": "Case Study Comparison",
        "content": "Comparing HIC vs LIC responses to earthquakes.",
        "keyPoints": [
          "HIC (Chile 2010): High building codes, fast recovery",
          "LIC (Nepal 2015): High death toll, slow international aid",
          "Monitoring vs Protection: MPPP strategies"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Ecosystems: Rainforests & Deserts',
  'Geography',
  'The Living World',
  '{
    "sections": [
      {
        "title": "Tropical Rainforests",
        "content": "Characterized by high biodiversity and a rapid nutrient cycle. Threats include logging and ranching.",
        "keyPoints": [
          "Biodiversity: Home to 50% of global species",
          "Nutrient Cycle: Fast decay due to heat/moisture",
          "Deforestation: Amazon logging and palm oil"
        ],
        "color": "primary"
      },
      {
        "title": "Sustainable Management",
        "content": "Reducing damage through selective logging, ecotourism, and international debt reduction.",
        "keyPoints": [
          "Debt-for-Nature Swaps: Saving land for debt relief",
          "Selective Logging: Removing only aged trees"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- ============================================
-- 6. COMPUTER SCIENCE
-- ============================================
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'CPU Architecture & Von Neumann',
  'Computer Science',
  'System Architecture',
  '{
    "sections": [
      {
        "title": "The CPU",
        "content": "The brain of the computer that performs the Fetch-Decode-Execute cycle.",
        "keyPoints": [
          "ALU: Performs logical and arithmetic operations",
          "CU: Controls the flow of data",
          "Registers: PC, MAR, MDR, and Accumulator",
          "Clock Speed: Measured in Gigahertz (GHz)"
        ],
        "color": "primary"
      },
      {
        "title": "Von Neumann Model",
        "content": "Architecture where both program instructions and data are stored in the same memory.",
        "keyPoints": [
          "Shared Memory: Fetch instructions via data bus",
          "Execution: Results stored in Accumulator"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "OCR"
  }'::jsonb
);

INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Network Threats & Defense',
  'Computer Science',
  'Network Security',
  '{
    "sections": [
      {
        "title": "Threats",
        "content": "Malicious attacks designed to access or destroy data.",
        "keyPoints": [
          "Phishing: Deceptive emails to steal info",
          "Brute Force: Trial and error passwords",
          "SQL Injection: Malicious code into web forms",
          "Social Engineering: Manipulating human error"
        ],
        "color": "primary"
      },
      {
        "title": "Prevention",
        "content": "Strategies to protect systems from intrusion.",
        "keyPoints": [
          "Firewalls: Control incoming/outgoing traffic",
          "Encryption: Scrambling data for privacy",
          "Penetration Testing: Simulating an attack"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- ============================================
-- 7. ENGLISH LITERATURE
-- ============================================
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'An Inspector Calls: Themes & Characters',
  'English Literature',
  'Modern Drama',
  '{
    "sections": [
      {
        "title": "Social Responsibility",
        "content": "Priestley uses the Birlings to champion collective responsibility over capitalist self-interest.",
        "keyPoints": [
          "Inspector Goole: A moral catalyst/socialist voice",
          "Theme: We are members of one body",
          "Arthur Birling: Represents unrepentant capitalism"
        ],
        "color": "primary"
      },
      {
        "title": "Class & Gender",
        "content": "Explores how elite status allows exploitation of the vulnerable, like Eva Smith.",
        "keyPoints": [
          "Sheila Birling: The character who changes most",
          "Gerald Croft: Represents the upper-class double standard"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Macbeth: Ambition & Fate',
  'English Literature',
  'Shakespeare',
  '{
    "sections": [
      {
        "title": "The Tragic Hero",
        "content": "Macbeth''s vaulting ambition leads him to moral decay and inevitable downfall.",
        "keyPoints": [
          "Hamartia: Ambition is his fatal flaw",
          "Divine Right of Kings: Regicide is a sin against nature",
          "Lady Macbeth: The catalyst for Duncan''s murder"
        ],
        "color": "primary"
      },
      {
        "title": "Supernatural & Appearance",
        "content": "The Three Witches and the hallucinations reflect internal psychological guilt.",
        "keyPoints": [
          "Fair is foul and foul is fair: Moral ambiguity",
          "Banquo''s Ghost: Symbol of Macbeth''s paranoia"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "Edexcel"
  }'::jsonb
);

-- ============================================
-- 8. BUSINESS
-- ============================================
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Business Activity & Marketing Basics',
  'Business',
  'Business Activity',
  '{
    "sections": [
      {
        "title": "Ownership & Risk",
        "content": "Choosing the right legal structure affects liability and growth.",
        "keyPoints": [
          "Sole Trader: Unlimited liability, total control",
          "Ltd: Limited liability, private shares",
          "Stakeholders: Employees, owners, customers"
        ],
        "color": "primary"
      },
      {
        "title": "Marketing Mix (4Ps)",
        "content": "Strategy involves balancing Product, Price, Place, and Promotion.",
        "keyPoints": [
          "Price: Skimming vs Penetration pricing",
          "Product: Lifecycle (Introduction to Decline)",
          "Promotion: Building brand awareness"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "Edexcel"
  }'::jsonb
);

-- ============================================
-- 9. ADVANCED SCIENCE (CORE TOPICS)
-- ============================================

-- BIOLOGY: Infection & Response
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Infection, Response & Immunity',
  'Biology',
  'Infection',
  '{
    "sections": [
      {
        "title": "Pathogens",
        "content": "Diseases are spread by viruses, bacteria, fungi, and protists.",
        "keyPoints": [
          "Viruses: Live inside cells (HIV, TMV)",
          "Bacteria: Produce toxins (Salmonella, Gonorrhoea)",
          "Malaria: Protist spread by mosquitoes"
        ],
        "color": "primary"
      },
      {
        "title": "Human Defense",
        "content": "The immune system uses white blood cells to destroy pathogens.",
        "keyPoints": [
          "Phagocytosis: Cells engulfing pathogens",
          "Antibodies: Target specific proteins",
          "Vaccinations: Weakened pathogens for immunity"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- CHEMISTRY: Chemical Bonding
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Bonding & Properties of Matter',
  'Chemistry',
  'Chemical Bonding',
  '{
    "sections": [
      {
        "title": "Ionic Bonding",
        "content": "Metal and non-metal atoms transfer electrons to form ions.",
        "keyPoints": [
          "Lattice Structure: Giant ionic lattice",
          "High Melting Point: Strong electrostatic forces",
          "Conductivity: Only when molten or dissolved"
        ],
        "color": "primary"
      },
      {
        "title": "Covalent & Metallic",
        "content": "Non-metals share electrons; metals have a sea of delocalised electrons.",
        "keyPoints": [
          "Covalent: Molecules (H2O) or Giant (Diamond)",
          "Metallic: Malleable and conduct electricity"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- PHYSICS: Electricity
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Electricity: Circuits & Components',
  'Physics',
  'Electricity',
  '{
    "sections": [
      {
        "title": "Circuit Basics",
        "content": "Current is the flow of charge; Potential Difference drives the flow.",
        "keyPoints": [
          "V = I x R (Ohm''s Law)",
          "Series: Current is the same everywhere",
          "Parallel: Voltage is the same in all branches"
        ],
        "color": "primary"
      },
      {
        "title": "Mains Electricity",
        "content": "AC vs DC and the components of a 3-pin plug.",
        "keyPoints": [
          "Live Wire (Brown): Carries 230V",
          "Neutral (Blue): Completes the circuit",
          "Earth (Green/Yellow): Safety wire"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "OCR"
  }'::jsonb
);

-- ============================================
-- 10. ADVANCED MATHS (ALGEBRA)
-- ============================================
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Algebra: Equations & Graphs',
  'Mathematics',
  'Algebra',
  '{
    "sections": [
      {
        "title": "Solving Equations",
        "content": "Balanced operations to find the value of x.",
        "keyPoints": [
          "Linear: x + 5 = 10",
          "Quadratic: ax² + bx + c = 0",
          "Simultaneous: Solving for two variables"
        ],
        "color": "primary"
      },
      {
        "title": "Sequences & Graphs",
        "content": "Identifying patterns and linear relationships.",
        "keyPoints": [
          "y = mx + c: Gradient and Intercept",
          "nth Term: Finding the rule for a sequence"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- ============================================
-- 11. HISTORY: ASIA & COLD WAR
-- ============================================
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Conflict and Tension in Asia (1950-1975)',
  'History',
  'Conflict in Asia',
  '{
    "sections": [
      {
        "title": "The Vietnam War",
        "content": "A proxy war where the US attempted to contain communism in South East Asia.",
        "keyPoints": [
          "Guerrilla Warfare: Vietcong used tunnels and traps",
          "US Tactics: Operation Rolling Thunder and Agent Orange",
          "Public Support: The war lost support due to media coverage",
          "Tet Offensive (1968): Turning point in public perception"
        ],
        "color": "primary"
      },
      {
        "title": "Korean War",
        "content": "The first major conflict of the Cold War where the UN intervened to protect South Korea.",
        "keyPoints": [
          "38th Parallel: The dividing line between North and South",
          "Inchon Landings: MacArthur''s strategic success",
          "End Result: Re-established the border at the 38th Parallel"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- HISTORY: COLD WAR
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'The Cold War: Origins & Crises',
  'History',
  'Cold War',
  '{
    "sections": [
      {
        "title": "Origins of Tensions",
        "content": "Ideological rift between Capitalism (USA) and Communism (USSR).",
        "keyPoints": [
          "Yalta & Potsdam: Disagreements over Poland and Germany",
          "Iron Curtain: Churchill''s speech in 1946",
          "Truman Doctrine: Containment of communism"
        ],
        "color": "primary"
      },
      {
        "title": "Key Crises",
        "content": "Moments where the world came close to nuclear war.",
        "keyPoints": [
          "Berlin Blockade (1948): LED to the Berlin Airlift",
          "Cuban Missile Crisis (1962): Closest the world came to war",
          "Berlin Wall (1961): Symbol of the Cold War division"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "Edexcel"
  }'::jsonb
);

-- ============================================
-- 12. GEOGRAPHY: RESOURCES & URBAN ISSUES
-- ============================================
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Resource Management: Food, Water, Energy',
  'Geography',
  'Resource Management',
  '{
    "sections": [
      {
        "title": "Resource Inequality",
        "content": "Global distribution of resources is uneven, leading to nutritional and energy insecurity.",
        "keyPoints": [
          "Food Insecurity: LICs struggle with malnutrition",
          "Water Stress: Physical vs Economic scarcity",
          "Energy Mix: Fossil fuels vs Renewable transition"
        ],
        "color": "primary"
      },
      {
        "title": "Sustainable Solutions",
        "content": "Methods to ensure resources are available for future generations.",
        "keyPoints": [
          "Hydroponics: Growing crops without soil",
          "Appropriate Technology: Low-cost tools for LICs"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- ============================================
-- 13. COMPUTER SCIENCE: DATA & STORAGE
-- ============================================
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Memory & Secondary Storage',
  'Computer Science',
  'System Architecture',
  '{
    "sections": [
      {
        "title": "Primary Memory",
        "content": "Fast memory directly accessible by the CPU.",
        "keyPoints": [
          "RAM: Volatile storage for data in use",
          "ROM: Non-volatile storage for boot instructions",
          "Virtual Memory: Use of secondary storage as RAM"
        ],
        "color": "primary"
      },
      {
        "title": "Secondary Storage",
        "content": "Non-volatile storage for permanent files and software.",
        "keyPoints": [
          "Magnetic (HDD): High capacity, low cost",
          "Solid State (SSD): Fast, durable, no moving parts",
          "Optical (Blue-Ray): Portable and cheap"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "OCR"
  }'::jsonb
);

-- ============================================
-- 14. ENGLISH LITERATURE: CLASSICS
-- ============================================
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'A Christmas Carol: Social Justice',
  'English Literature',
  '19th Century Prose',
  '{
    "sections": [
      {
        "title": "Scrooge''s Transformation",
        "content": "Scrooge evolves from a miserly recluse to a generous benefactor.",
        "keyPoints": [
          "Marley''s Ghost: The chain of greed and regret",
          "Ghost of Christmas Present: Shows the Cratchits",
          "Ghost of Christmas Yet to Come: The fear of death"
        ],
        "color": "primary"
      },
      {
        "title": "Social Critique",
        "content": "Dickens attacks the Victorian indifference towards the poor.",
        "keyPoints": [
          "Ignorance and Want: The personified children",
          "Workhouse System: Are there no prisons?",
          "Tiny Tim: Symbol of the innocent poor"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- ============================================
-- 15. FURTHER SCIENCE
-- ============================================

-- BIOLOGY: Bioenergetics
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Bioenergetics: Photosynthesis & Respiration',
  'Biology',
  'Bioenergetics',
  '{
    "sections": [
      {
        "title": "Photosynthesis",
        "content": "Process where plants convert light energy into chemical energy.",
        "keyPoints": [
          "Equation: 6CO2 + 6H2O -> C6H12O6 + 6O2",
          "Limiting Factors: Light, CO2, and Temperature",
          "Uses of Glucose: Storage (Starch) and Cellulose"
        ],
        "color": "primary"
      },
      {
        "title": "Cellular Respiration",
        "content": "Releasing energy from glucose for movement and growth.",
        "keyPoints": [
          "Aerobic: With Oxygen (Mitochondria)",
          "Anaerobic: Without Oxygen (Lactic Acid)",
          "Fermentation: In yeast (Ethanol and CO2)"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- CHEMISTRY: Organic Chemistry
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Organic Chemistry: Hydrocarbons',
  'Chemistry',
  'Organic Chemistry',
  '{
    "sections": [
      {
        "title": "Alkanes & Alkenes",
        "content": "Homologous series of hydrocarbons found in crude oil.",
        "keyPoints": [
          "Alkanes: Single bonds (Saturated)",
          "Alkenes: Double bonds (Unsaturated)",
          "Cracking: Breaking long chains into short ones"
        ],
        "color": "primary"
      },
      {
        "title": "Crude Oil",
        "content": "Separated into useful fractions by fractional distillation.",
        "keyPoints": [
          "Boiling Point: Increases with chain length",
          "Viscosity: Increases with chain length",
          "Flammability: Decreases with chain length"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "Edexcel"
  }'::jsonb
);

-- PHYSICS: Waves
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Waves: Electromagnetic Spectrum',
  'Physics',
  'Waves',
  '{
    "sections": [
      {
        "title": "Wave Properties",
        "content": "Waves transfer energy without transferring matter.",
        "keyPoints": [
          "Transverse: Oscillate at 90 degrees (Light)",
          "Longitudinal: Oscillate parallel (Sound)",
          "Velocity = Frequency x Wavelength"
        ],
        "color": "primary"
      },
      {
        "title": "The EM Spectrum",
        "content": "Range of light frequencies from Radio to Gamma.",
        "keyPoints": [
          "Radio: Communication",
          "X-Ray: Medical imaging",
          "Gamma: Sterilization (Harmful/Ionising)"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- MATHS: Probability
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Probability & Combined Events',
  'Mathematics',
  'Probability',
  '{
    "sections": [
      {
        "title": "Basic Probability",
        "content": "Probability is measured on a scale from 0 (impossible) to 1 (certain).",
        "keyPoints": [
          "P(Event) = Favourable Outcomes / Total Outcomes",
          "Sum of probabilities of all outcomes is 1",
          "Mutually Exclusive: Events that cannot happen at the same time"
        ],
        "color": "primary"
      },
      {
        "title": "Combined Events",
        "content": "Using tree diagrams and Venn diagrams to calculate probabilities.",
        "keyPoints": [
          "AND Rule: Multiply probabilities (P(A and B) = P(A) x P(B))",
          "OR Rule: Add probabilities (P(A or B) = P(A) + P(B))"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "Edexcel"
  }'::jsonb
);

-- MATHS: Statistics
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Statistics: Averages & Data Analysis',
  'Mathematics',
  'Statistics',
  '{
    "sections": [
      {
        "title": "Averages & Range",
        "content": "Measures of central tendency and spread.",
        "keyPoints": [
          "Mean: Sum of values / Number of values",
          "Median: Middle value when ordered",
          "Mode: Most frequent value",
          "Range: Difference between highest and lowest"
        ],
        "color": "primary"
      },
      {
        "title": "Data Representation",
        "content": "Ways to visualize data for easier analysis.",
        "keyPoints": [
          "Histograms: Frequency density",
          "Box Plots: Showing quartiles and outliers",
          "Scatter Graphs: Identifying correlation"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "OCR"
  }'::jsonb
);

-- ============================================
-- 16. ADDITIONAL KNOWLEDGE ORGANISERS
-- ============================================

-- BIOLOGY: Homeostasis
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Homeostasis & Blood Glucose Control',
  'Biology',
  'Homeostasis',
  '{
    "sections": [
      {
        "title": "What is Homeostasis?",
        "content": "The maintenance of a constant internal environment despite external changes.",
        "keyPoints": [
          "Body temperature: Maintained around 37°C",
          "Blood glucose: Controlled by insulin and glucagon",
          "Water balance: Regulated by kidneys",
          "Negative feedback: Reverses changes to maintain stability"
        ],
        "color": "primary"
      },
      {
        "title": "Blood Glucose Control",
        "content": "The pancreas produces hormones to regulate blood sugar levels.",
        "keyPoints": [
          "Insulin: Lowers blood glucose (released when high)",
          "Glucagon: Raises blood glucose (released when low)",
          "Type 1 Diabetes: Pancreas produces little/no insulin",
          "Type 2 Diabetes: Body becomes resistant to insulin"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- CHEMISTRY: Rates of Reaction
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Rates of Reaction & Collision Theory',
  'Chemistry',
  'Rates of Reaction',
  '{
    "sections": [
      {
        "title": "Factors Affecting Rate",
        "content": "Four main factors influence how fast a reaction occurs.",
        "keyPoints": [
          "Temperature: Higher = more collisions, faster rate",
          "Concentration: Higher = more particles, more collisions",
          "Surface Area: Larger = more area for collisions",
          "Catalysts: Speed up reaction without being used up"
        ],
        "color": "primary"
      },
      {
        "title": "Collision Theory",
        "content": "Particles must collide with sufficient energy and correct orientation.",
        "keyPoints": [
          "Activation Energy: Minimum energy needed for reaction",
          "Successful Collisions: Must have enough energy",
          "Catalysts: Lower activation energy"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- PHYSICS: Forces & Motion
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Forces, Motion & Newton''s Laws',
  'Physics',
  'Forces',
  '{
    "sections": [
      {
        "title": "Newton''s Laws",
        "content": "Three fundamental laws describing motion and forces.",
        "keyPoints": [
          "1st Law: Object at rest stays at rest (inertia)",
          "2nd Law: F = ma (Force = mass × acceleration)",
          "3rd Law: Action and reaction are equal and opposite"
        ],
        "color": "primary"
      },
      {
        "title": "Motion Equations",
        "content": "Key formulas for calculating motion.",
        "keyPoints": [
          "Distance = Speed × Time (s = vt)",
          "Acceleration = (v - u) / t",
          "Weight = Mass × Gravity (W = mg)"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- MATHEMATICS: Ratio & Proportion
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Ratio, Proportion & Scale',
  'Mathematics',
  'Ratio',
  '{
    "sections": [
      {
        "title": "Simplifying Ratios",
        "content": "Reduce ratios to their simplest form by dividing by the HCF.",
        "keyPoints": [
          "Find HCF of both numbers",
          "Divide both parts by HCF",
          "Keep in same units (convert if needed)"
        ],
        "color": "primary"
      },
      {
        "title": "Direct & Inverse Proportion",
        "content": "Understanding how quantities relate to each other.",
        "keyPoints": [
          "Direct: y = kx (both increase together)",
          "Inverse: y = k/x (one increases, other decreases)",
          "Use ratios to solve proportion problems"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "Edexcel"
  }'::jsonb
);

-- ============================================
-- 17. ADDITIONAL KNOWLEDGE ORGANISERS (20+ more)
-- ============================================

-- BIOLOGY: Ecology
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Ecology: Food Chains & Ecosystems',
  'Biology',
  'Ecology',
  '{
    "sections": [
      {
        "title": "Food Chains & Webs",
        "content": "Energy flows through ecosystems from producers to consumers.",
        "keyPoints": [
          "Producer: Makes own food (plants)",
          "Primary Consumer: Eats producers (herbivores)",
          "Secondary Consumer: Eats primary consumers (carnivores)",
          "Decomposer: Breaks down dead matter"
        ],
        "color": "primary"
      },
      {
        "title": "Energy Transfer",
        "content": "Only 10% of energy is transferred between trophic levels.",
        "keyPoints": [
          "90% lost as heat, movement, waste",
          "Biomass decreases up the food chain",
          "Pyramids of biomass show this relationship"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- BIOLOGY: Evolution
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Evolution & Natural Selection',
  'Biology',
  'Evolution',
  '{
    "sections": [
      {
        "title": "Natural Selection",
        "content": "Process where advantageous traits become more common in a population.",
        "keyPoints": [
          "Variation exists in populations",
          "Competition for resources",
          "Survival of the fittest",
          "Advantageous traits passed to offspring"
        ],
        "color": "primary"
      },
      {
        "title": "Evidence for Evolution",
        "content": "Multiple lines of evidence support the theory of evolution.",
        "keyPoints": [
          "Fossils: Show gradual changes over time",
          "DNA: Similarities between species",
          "Antibiotic resistance: Evolution in action"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- CHEMISTRY: Electrolysis
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Electrolysis: Breaking Down Compounds',
  'Chemistry',
  'Electrolysis',
  '{
    "sections": [
      {
        "title": "What is Electrolysis?",
        "content": "The breakdown of a compound using electricity.",
        "keyPoints": [
          "Requires an electrolyte (molten or dissolved)",
          "Needs a power supply (DC current)",
          "Electrodes: Anode (positive) and Cathode (negative)"
        ],
        "color": "primary"
      },
      {
        "title": "What Happens at Each Electrode?",
        "content": "Ions move to opposite electrodes and gain or lose electrons.",
        "keyPoints": [
          "Anode: Negative ions lose electrons (oxidation)",
          "Cathode: Positive ions gain electrons (reduction)",
          "OIL RIG: Oxidation Is Loss, Reduction Is Gain"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- CHEMISTRY: Energy Changes
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Energy Changes in Reactions',
  'Chemistry',
  'Energy Changes',
  '{
    "sections": [
      {
        "title": "Exothermic Reactions",
        "content": "Reactions that release energy to the surroundings.",
        "keyPoints": [
          "Temperature of surroundings increases",
          "Examples: Combustion, neutralization",
          "Products have less energy than reactants"
        ],
        "color": "primary"
      },
      {
        "title": "Endothermic Reactions",
        "content": "Reactions that take in energy from the surroundings.",
        "keyPoints": [
          "Temperature of surroundings decreases",
          "Examples: Thermal decomposition",
          "Products have more energy than reactants"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- PHYSICS: Magnetism
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Magnetism & Electromagnetism',
  'Physics',
  'Magnetism',
  '{
    "sections": [
      {
        "title": "Magnetic Fields",
        "content": "The region around a magnet where magnetic forces act.",
        "keyPoints": [
          "Field lines go from North to South",
          "Like poles repel, opposite poles attract",
          "Stronger near the poles"
        ],
        "color": "primary"
      },
      {
        "title": "Electromagnets",
        "content": "Magnets created by passing current through a coil.",
        "keyPoints": [
          "Strength increases with more turns or more current",
          "Can be turned on/off",
          "Used in motors, generators, and relays"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- PHYSICS: Particle Model
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Particle Model of Matter',
  'Physics',
  'Particle Model',
  '{
    "sections": [
      {
        "title": "States of Matter",
        "content": "Matter exists in three states with different particle arrangements.",
        "keyPoints": [
          "Solid: Fixed shape, particles vibrate in place",
          "Liquid: Takes container shape, particles can move",
          "Gas: Fills container, particles move freely"
        ],
        "color": "primary"
      },
      {
        "title": "Density & Pressure",
        "content": "Density is mass per unit volume. Pressure is force per unit area.",
        "keyPoints": [
          "Density = Mass / Volume (ρ = m/V)",
          "Pressure = Force / Area (P = F/A)",
          "Particles in gases exert pressure on container walls"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- MATHEMATICS: Fractions
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Fractions: Operations & Conversions',
  'Mathematics',
  'Number',
  '{
    "sections": [
      {
        "title": "Adding & Subtracting Fractions",
        "content": "Find a common denominator before adding or subtracting.",
        "keyPoints": [
          "Find LCM of denominators",
          "Convert to equivalent fractions",
          "Add/subtract numerators, keep denominator"
        ],
        "color": "primary"
      },
      {
        "title": "Multiplying & Dividing Fractions",
        "content": "Multiply numerators and denominators separately. To divide, flip and multiply.",
        "keyPoints": [
          "Multiply: (a/b) × (c/d) = ac/bd",
          "Divide: (a/b) ÷ (c/d) = (a/b) × (d/c)",
          "Simplify the answer"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- MATHEMATICS: Percentages
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Percentages: Calculations & Applications',
  'Mathematics',
  'Number',
  '{
    "sections": [
      {
        "title": "Finding Percentages",
        "content": "Calculate percentages of amounts using multiplication.",
        "keyPoints": [
          "Percentage of amount: (percentage/100) × amount",
          "Percentage increase: amount × (1 + percentage/100)",
          "Percentage decrease: amount × (1 - percentage/100)"
        ],
        "color": "primary"
      },
      {
        "title": "Reverse Percentages",
        "content": "Find the original amount when you know the percentage change.",
        "keyPoints": [
          "If increased by 20%, divide by 1.2",
          "If decreased by 15%, divide by 0.85",
          "Set up equations: original × multiplier = new"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "Edexcel"
  }'::jsonb
);

-- ENGLISH: Language Analysis
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Language Analysis: Structure & Effect',
  'English Language',
  'Language Analysis',
  '{
    "sections": [
      {
        "title": "Structural Features",
        "content": "How a text is organized affects meaning and impact.",
        "keyPoints": [
          "Paragraph length: Short for emphasis, long for detail",
          "Sentence variety: Mix of simple and complex",
          "Opening/Closing: Hook reader, leave lasting impression"
        ],
        "color": "primary"
      },
      {
        "title": "Language Devices",
        "content": "Writers use specific techniques to create effects.",
        "keyPoints": [
          "Imagery: Simile, metaphor, personification",
          "Sound: Alliteration, onomatopoeia, sibilance",
          "Emphasis: Repetition, rhetorical questions"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- GEOGRAPHY: Urban Issues
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Urban Issues & Challenges',
  'Geography',
  'Urban Issues',
  '{
    "sections": [
      {
        "title": "Urban Growth",
        "content": "Cities are growing rapidly, especially in LICs.",
        "keyPoints": [
          "Push factors: Lack of jobs, poor services in rural areas",
          "Pull factors: Better opportunities, healthcare, education",
          "Megacities: Over 10 million inhabitants"
        ],
        "color": "primary"
      },
      {
        "title": "Urban Challenges",
        "content": "Rapid growth creates problems for cities.",
        "keyPoints": [
          "Housing: Slums and informal settlements",
          "Traffic: Congestion and pollution",
          "Services: Strain on water, waste, healthcare"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- HISTORY: Norman Conquest
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'The Norman Conquest: 1066 & Aftermath',
  'History',
  'Norman Conquest',
  '{
    "sections": [
      {
        "title": "The Battle of Hastings",
        "content": "14th October 1066 - William of Normandy defeats Harold Godwinson.",
        "keyPoints": [
          "Harold''s army weakened by Battle of Stamford Bridge",
          "William''s cavalry and archers decisive",
          "Harold killed, William becomes King of England"
        ],
        "color": "primary"
      },
      {
        "title": "Norman Control",
        "content": "William established control through castles and the Domesday Book.",
        "keyPoints": [
          "Motte and Bailey castles: Quick to build, defensive",
          "Domesday Book (1086): Survey of all land and property",
          "Feudal System: Hierarchical land ownership"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "Edexcel"
  }'::jsonb
);

-- COMPUTER SCIENCE: Programming Basics
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Programming: Variables, Selection & Iteration',
  'Computer Science',
  'Programming',
  '{
    "sections": [
      {
        "title": "Variables & Data Types",
        "content": "Variables store data that can change during program execution.",
        "keyPoints": [
          "Integer: Whole numbers (e.g., 5, -10)",
          "String: Text (e.g., \"Hello\")",
          "Boolean: True or False",
          "Float: Decimal numbers (e.g., 3.14)"
        ],
        "color": "primary"
      },
      {
        "title": "Control Structures",
        "content": "Selection and iteration control program flow.",
        "keyPoints": [
          "Selection: IF/ELSE statements make decisions",
          "Iteration: FOR and WHILE loops repeat code",
          "Nested structures: Loops and conditions inside each other"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "OCR"
  }'::jsonb
);

-- BIOLOGY: Human Biology
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Human Biology: Organ Systems',
  'Biology',
  'Human Biology',
  '{
    "sections": [
      {
        "title": "Circulatory System",
        "content": "Transports oxygen, nutrients, and waste around the body.",
        "keyPoints": [
          "Heart: Pumps blood through arteries and veins",
          "Red blood cells: Carry oxygen using hemoglobin",
          "White blood cells: Fight infection"
        ],
        "color": "primary"
      },
      {
        "title": "Respiratory System",
        "content": "Exchanges gases between the body and environment.",
        "keyPoints": [
          "Lungs: Site of gas exchange",
          "Alveoli: Tiny air sacs with large surface area",
          "Oxygen diffuses into blood, CO2 diffuses out"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- CHEMISTRY: Chemical Analysis
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Chemical Analysis: Tests & Identification',
  'Chemistry',
  'Chemical Analysis',
  '{
    "sections": [
      {
        "title": "Flame Tests",
        "content": "Metal ions produce characteristic flame colors.",
        "keyPoints": [
          "Lithium: Crimson red",
          "Sodium: Yellow",
          "Potassium: Lilac",
          "Calcium: Orange-red"
        ],
        "color": "primary"
      },
      {
        "title": "Gas Tests",
        "content": "Different gases can be identified by specific tests.",
        "keyPoints": [
          "Hydrogen: Squeaky pop with lit splint",
          "Oxygen: Relights glowing splint",
          "Carbon Dioxide: Turns limewater cloudy",
          "Chlorine: Bleaches damp litmus paper"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- PHYSICS: Forces & Motion
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Forces & Motion: Calculations',
  'Physics',
  'Motion',
  '{
    "sections": [
      {
        "title": "Motion Equations",
        "content": "Key formulas for calculating distance, speed, and acceleration.",
        "keyPoints": [
          "Distance = Speed × Time (s = vt)",
          "Acceleration = (Final Velocity - Initial Velocity) / Time",
          "Average Speed = Total Distance / Total Time"
        ],
        "color": "primary"
      },
      {
        "title": "Distance-Time Graphs",
        "content": "Graphs show how distance changes over time.",
        "keyPoints": [
          "Straight line: Constant speed",
          "Curved line: Changing speed (acceleration)",
          "Horizontal line: Stationary (not moving)"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- MATHEMATICS: Algebra - Expanding & Factorising
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Algebra: Expanding & Factorising',
  'Mathematics',
  'Algebra',
  '{
    "sections": [
      {
        "title": "Expanding Brackets",
        "content": "Multiply each term inside by each term outside.",
        "keyPoints": [
          "Single: a(b + c) = ab + ac",
          "Double: (a + b)(c + d) = ac + ad + bc + bd",
          "FOIL: First, Outer, Inner, Last"
        ],
        "color": "primary"
      },
      {
        "title": "Factorising",
        "content": "Reverse of expanding - find common factors.",
        "keyPoints": [
          "Common factor: ab + ac = a(b + c)",
          "Quadratic: x² + 5x + 6 = (x + 2)(x + 3)",
          "Difference of squares: a² - b² = (a + b)(a - b)"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "Edexcel"
  }'::jsonb
);

-- ENGLISH LITERATURE: Poetry Analysis
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Poetry Analysis: Form, Structure & Language',
  'English Literature',
  'Poetry',
  '{
    "sections": [
      {
        "title": "Poetic Form",
        "content": "The structure and pattern of a poem affects its meaning.",
        "keyPoints": [
          "Stanza: Group of lines (like a paragraph)",
          "Rhyme scheme: Pattern of rhyming (ABAB, AABB)",
          "Meter: Rhythm pattern (iambic pentameter)"
        ],
        "color": "primary"
      },
      {
        "title": "Poetic Devices",
        "content": "Writers use specific techniques to create imagery and meaning.",
        "keyPoints": [
          "Metaphor: Direct comparison (life is a journey)",
          "Simile: Comparison using like/as",
          "Enjambment: Line continues into next"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- GEOGRAPHY: Weather & Climate
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Weather & Climate: Patterns & Causes',
  'Geography',
  'Weather & Climate',
  '{
    "sections": [
      {
        "title": "Weather vs Climate",
        "content": "Weather is short-term, climate is long-term patterns.",
        "keyPoints": [
          "Weather: Day-to-day conditions (temperature, rain)",
          "Climate: Average weather over 30+ years",
          "Factors: Latitude, altitude, distance from sea"
        ],
        "color": "primary"
      },
      {
        "title": "UK Climate",
        "content": "Temperate maritime climate with mild, wet winters.",
        "keyPoints": [
          "Influenced by North Atlantic Drift (warm current)",
          "Prevailing winds from southwest",
          "Rainfall varies: West wetter than East"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "AQA"
  }'::jsonb
);

-- HISTORY: World War I
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'World War I: Causes & Key Events',
  'History',
  'World War I',
  '{
    "sections": [
      {
        "title": "Causes of WWI",
        "content": "Multiple factors led to the outbreak of war in 1914.",
        "keyPoints": [
          "Militarism: Arms race between nations",
          "Alliances: Triple Entente vs Triple Alliance",
          "Imperialism: Competition for colonies",
          "Nationalism: Pride and rivalry between countries"
        ],
        "color": "primary"
      },
      {
        "title": "Key Events",
        "content": "Major battles and turning points of the war.",
        "keyPoints": [
          "1914: War begins, Battle of the Marne",
          "1916: Battle of the Somme, Verdun",
          "1917: USA enters war, Russian Revolution",
          "1918: Armistice signed, war ends"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "Edexcel"
  }'::jsonb
);

-- COMPUTER SCIENCE: Data Representation
INSERT INTO public.global_knowledge_organizers (title, subject, topic, content)
VALUES (
  'Data Representation: Binary & Hexadecimal',
  'Computer Science',
  'Data Representation',
  '{
    "sections": [
      {
        "title": "Binary System",
        "content": "Computers use binary (base 2) to represent data.",
        "keyPoints": [
          "Only uses 0 and 1 (bits)",
          "Each position is a power of 2",
          "8 bits = 1 byte",
          "Binary to decimal: Add powers of 2"
        ],
        "color": "primary"
      },
      {
        "title": "Hexadecimal",
        "content": "Base 16 system using 0-9 and A-F.",
        "keyPoints": [
          "More compact than binary",
          "Each hex digit = 4 bits",
          "Used for memory addresses and colors"
        ],
        "color": "secondary"
      }
    ],
    "exam_board": "OCR"
  }'::jsonb
);

-- ============================================
-- 18. FINAL BACKFILL FOR EXISTING USERS
-- ============================================
INSERT INTO public.knowledge_organizers (user_id, title, subject, topic, content)
SELECT 
  p.id AS user_id,
  g.title,
  g.subject,
  g.topic,
  g.content
FROM public.profiles p
CROSS JOIN public.global_knowledge_organizers g
WHERE NOT EXISTS (
  SELECT 1 FROM public.knowledge_organizers ko
  WHERE ko.user_id = p.id 
  AND ko.title = g.title
);
