-- ============================================
-- Extended Global Flashcards
-- Adding more topics and depth to existing subjects
-- ============================================

INSERT INTO public.global_flashcards (front, back, subject, topic) VALUES
-- =====================
-- BIOLOGY: Genetics & Inheritance (Extended)
-- =====================
('What is DNA?', 'A polymer made up of two strands forming a double helix', 'Biology', 'Genetics'),
('What are the four bases in DNA?', 'A, C, G, T', 'Biology', 'Genetics'),
('Which DNA bases pair together?', 'A with T, C with G', 'Biology', 'Genetics'),
('What is a mutation?', 'A random change in the DNA sequence', 'Biology', 'Genetics'),
('What is meiosis?', 'Cell division that produces gametes (sex cells) with half the number of chromosomes', 'Biology', 'Genetics'),
('How many cell divisions occur in meiosis?', 'Two', 'Biology', 'Genetics'),
('What is the difference between mitosis and meiosis?', 'Mitosis: 2 identical cells (growth/repair). Meiosis: 4 non-identical cells (gametes).', 'Biology', 'Genetics'),

-- =====================
-- CHEMISTRY: Organic Chemistry
-- =====================
('What is a hydrocarbon?', 'A compound consisting of hydrogen and carbon only', 'Chemistry', 'Organic Chemistry'),
('What is the general formula for alkanes?', 'CnH2n+2', 'Chemistry', 'Organic Chemistry'),
('What is the general formula for alkenes?', 'CnH2n', 'Chemistry', 'Organic Chemistry'),
('What is fractional distillation?', 'Separating crude oil into fractions based on boiling points', 'Chemistry', 'Organic Chemistry'),
('What is cracking?', 'Breaking down long-chain hydrocarbons into shorter, more useful ones', 'Chemistry', 'Organic Chemistry'),
('What is the test for alkenes?', 'Bromine water turns from orange to colourless', 'Chemistry', 'Organic Chemistry'),

-- =====================
-- PHYSICS: Waves
-- =====================
('What is a transverse wave?', 'Oscillations are perpendicular (90°) to the direction of energy transfer', 'Physics', 'Waves'),
('What is a longitudinal wave?', 'Oscillations are parallel to the direction of energy transfer', 'Physics', 'Waves'),
('Give an example of a transverse wave', 'Light, water ripples, radio waves', 'Physics', 'Waves'),
('Give an example of a longitudinal wave', 'Sound waves', 'Physics', 'Waves'),
('What is the formula for wave speed?', 'Wave speed = Frequency × Wavelength (v = fλ)', 'Physics', 'Waves'),
('What is the human hearing range?', '20 Hz to 20,000 Hz', 'Physics', 'Waves'),

-- =====================
-- GEOGRAPHY: Rivers & Coasts
-- =====================
('What is hydraulic action?', 'The force of water crashing against the bank, forcing air into cracks and breaking it apart', 'Geography', 'Physical Landscapes'),
('What is abrasion?', 'Rocks/sediment carried by the water wearing away the bed and banks', 'Geography', 'Physical Landscapes'),
('What is attrition?', 'Rocks bumping into each other and becoming smaller/rounder', 'Geography', 'Physical Landscapes'),
('What is a meander?', 'A bend in a river', 'Geography', 'Physical Landscapes'),
('What is longshore drift?', 'The movement of sediment along a coast by waves at an angle', 'Geography', 'Physical Landscapes'),

-- =====================
-- HISTORY: Elizabethan England
-- =====================
('Who was Mary Queen of Scots?', 'Elizabeth I''s cousin and a potential Catholic heir to the throne', 'History', 'Elizabethan England'),
('What was the Spanish Armada?', 'A Spanish fleet sent to invade England in 1588', 'History', 'Elizabethan England'),
('Why did the Spanish Armada fail?', 'English fire ships, better English cannons/ships, and bad weather', 'History', 'Elizabethan England'),
('What was the Religious Settlement (1559)?', 'Elizabeth''s attempt to find a "middle way" between Catholicism and Protestantism', 'History', 'Elizabethan England'),

-- =====================
-- COMPUTER SCIENCE: Data Representation
-- =====================
('What is binary?', 'A number system using only 0 and 1', 'Computer Science', 'Data Representation'),
('What is a bit?', 'A single binary digit (0 or 1)', 'Computer Science', 'Data Representation'),
('What is a byte?', '8 bits', 'Computer Science', 'Data Representation'),
('How many bits is a nibble?', '4 bits', 'Computer Science', 'Data Representation'),
('What is ASCII?', 'A character encoding standard for electronic communication', 'Computer Science', 'Data Representation'),
('What is the difference between lossy and lossless compression?', 'Lossy permanently removes data to reduce size; Lossless retains all data', 'Computer Science', 'Data Representation');

-- ============================================
-- Backfill for Existing Users
-- (Same logic as global_flashcards.sql to ensure all users get new cards)
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
  AND f.topic = g.topic
);
