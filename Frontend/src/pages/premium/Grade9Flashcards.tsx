import { AppLayout } from "@/components/layout/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { hasPremium } from "@/lib/premium";
import { cn } from "@/lib/utils";
import {
    ArrowLeft,
    ArrowRight,
    ChevronLeft,
    Crown,
    Layers,
    Lock,
    RotateCcw,
    Shuffle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Flashcard {
    id: string;
    question: string;
    answer: string;
    topic: string;
}

interface FlashcardSet {
    subject: string;
    cards: Flashcard[];
}

// Premium Grade 9 Flashcard Content - 60+ Cards
const flashcardData: FlashcardSet[] = [
    {
        "subject": "Mathematics",
        "cards": [
            { "id": "m1", "topic": "Trigonometry", "question": "What is the sine rule for finding a length?", "answer": "a/sinA = b/sinB\n\nUsed when you have a pair of opposite side and angle." },
            { "id": "m2", "topic": "Trigonometry", "question": "What is the sine rule for finding an angle?", "answer": "sinA/a = sinB/b\n\nUsed when you have a pair of opposite side and angle." },
            { "id": "m3", "topic": "Trigonometry", "question": "What is the cosine rule for finding a length?", "answer": "a² = b² + c² - 2bcCosA\n\nUsed when you have two sides and the included angle (SAS)." },
            { "id": "m4", "topic": "Trigonometry", "question": "What is the cosine rule for finding an angle?", "answer": "CosA = (b² + c² - a²) / 2bc\n\nUsed when you have all three side lengths." },
            { "id": "m5", "topic": "Trigonometry", "question": "In order to find an angle using cosine rule you need...", "answer": "All 3 lengths\n\nThis allows you to calculate the angle using the cosine rule formula." },
            { "id": "m6", "topic": "Trigonometry", "question": "In order to find a length using cosine rule you need...", "answer": "The other two lengths and the opposite angle\n\nThis is the SAS (side-angle-side) case." },
            { "id": "m7", "topic": "Trigonometry", "question": "In order to find an angle using sine rule you need...", "answer": "The opposite angle and another length and angle\n\nYou need a complete opposite pair plus one more measurement." },
            { "id": "m8", "topic": "Trigonometry", "question": "In order to find a length using sine rule you need...", "answer": "The opposite length and another length and angle\n\nYou need a complete opposite pair plus one more measurement." },
            { "id": "m9", "topic": "Trigonometry", "question": "What is the formula for the area of a triangle?", "answer": "½abSinC\n\nUsed when you know two sides and the included angle." },
            { "id": "m10", "topic": "Trigonometry", "question": "What is the ambiguous case for sine rule?", "answer": "sin x = sin (180 - x)\n\nThis means the sine rule can sometimes give two possible solutions for an angle." },
            { "id": "m11", "topic": "Algebra", "question": "What is the difference of two squares (D.O.T.S.)?", "answer": "(a + b)(a - b) = a² - b²\n\nUseful for factorising expressions like x² - 9 = (x + 3)(x - 3)" },
            { "id": "m12", "topic": "Algebra", "question": "What is the quadratic formula?", "answer": "x = (-b ± √(b² - 4ac)) / 2a\n\nUsed to solve equations in the form ax² + bx + c = 0" },
            { "id": "m13", "topic": "Algebra", "question": "What is the formula for completing the square?", "answer": "(x ± b/2)² - (b/2)² ± c\n\nStep 1: Half the coefficient of x\nStep 2: Square it\nStep 3: Adjust the constant term" },
            { "id": "m14", "topic": "Algebra", "question": "What is the general form of a quadratic?", "answer": "ax² + bx + c\n\nWhere a ≠ 0, and a, b, c are constants." },
            { "id": "m15", "topic": "Circle Theorems", "question": "Circle theorem: What do angles in opposite segments add up to?", "answer": "a + b = 180\n\nAngles in the same segment are equal." },
            { "id": "m16", "topic": "Circle Theorems", "question": "Circle theorem: How does the angle at the centre compare to the angle at the circumference?", "answer": "Centre angle = 2 × Circumference angle\n\nThe angle at the centre is twice the angle at the circumference when subtended by the same arc." },
            { "id": "m17", "topic": "Circle Theorems", "question": "Circle theorem: What do opposite angles of a cyclic quadrilateral add up to?", "answer": "Opposite angles add up to 180°\n\na + c = 180°\nb + d = 180°" },
            { "id": "m18", "topic": "Circle Theorems", "question": "Circle theorem: What angle is formed in a semi-circle?", "answer": "90°\n\nAngles in a semi-circle always equal 90°." },
            { "id": "m19", "topic": "Circle Theorems", "question": "Circle theorem: What angle does a tangent meet a radius at?", "answer": "90°\n\nA tangent always meets a radius at right angles." },
            { "id": "m20", "topic": "Circle Theorems", "question": "Circle theorem: What can you say about two tangents from the same point?", "answer": "They are equal in length\n\nTwo tangents to a circle from the same external point will always be equal in length." },
            { "id": "m21", "topic": "Circle Theorems", "question": "Circle theorem: What is the alternate segment theorem?", "answer": "The angle between a tangent and chord equals the angle in the alternate segment.\n\nx = x, y = y" },
            { "id": "m22", "topic": "Circle Theorems", "question": "Circle theorem: What is the relationship for two chords intersecting inside the circle?", "answer": "AP × PB = CP × PD\n\nWhere P is the point of intersection." },
            { "id": "m23", "topic": "Circle Theorems", "question": "Circle theorem: What is the relationship for two chords that intersect outside the circle?", "answer": "AP × BP = CP × DP\n\nWhere P is the point of intersection outside the circle." },
            { "id": "m24", "topic": "Circle Theorems", "question": "Circle theorem: What is the special case for intersecting chords?", "answer": "AP² = CP × DP\n\nThis is when one chord passes through the centre." },
            { "id": "m25", "topic": "Algebra", "question": "What is the binomial expansion of (x + y)⁰?", "answer": "1\n\nAnything to the power of 0 equals 1." },
            { "id": "m26", "topic": "Algebra", "question": "What is the binomial expansion of (x + y)¹?", "answer": "1x + 1y\n\nSimply x + y" },
            { "id": "m27", "topic": "Algebra", "question": "What is the binomial expansion of (x + y)²?", "answer": "1x² + 2xy + 1y²\n\nCoefficients: 1, 2, 1" },
            { "id": "m28", "topic": "Algebra", "question": "What is the binomial expansion of (x + y)³?", "answer": "1x³ + 3x²y + 3xy² + 1y³\n\nCoefficients: 1, 3, 3, 1" },
            { "id": "m29", "topic": "Algebra", "question": "What is the binomial expansion of (x + y)⁴?", "answer": "1x⁴ + 4x³y + 6x²y² + 4xy³ + 1y⁴\n\nCoefficients: 1, 4, 6, 4, 1" },
            { "id": "m30", "topic": "Algebra", "question": "What is the binomial expansion of (x + y)⁵?", "answer": "1x⁵ + 5x⁴y + 10x³y² + 10x²y³ + 5xy⁴ + 1y⁵\n\nCoefficients: 1, 5, 10, 10, 5, 1" },
            { "id": "m31", "topic": "Algebra", "question": "In binomial expansion, what do the sum of the powers of each term add to?", "answer": "The initial power the expression was raised to\n\nFor (x + y)ⁿ, each term's powers add to n." },
            { "id": "m32", "topic": "Algebra", "question": "In binomial expansion, what are the coefficients?", "answer": "Pascal's triangle\n\nEach row gives the coefficients for the corresponding power." },
            { "id": "m33", "topic": "Statistics", "question": "What is the lower quartile (Q1)?", "answer": "¼n\n\nThe value at the 25th percentile of the data." },
            { "id": "m34", "topic": "Statistics", "question": "What is the median (Q2)?", "answer": "½n\n\nThe middle value of the data set (50th percentile)." },
            { "id": "m35", "topic": "Statistics", "question": "What is the upper quartile (Q3)?", "answer": "¾n\n\nThe value at the 75th percentile of the data." },
            { "id": "m36", "topic": "Statistics", "question": "What is the total (Q4)?", "answer": "n\n\nThe total number of data values." },
            { "id": "m37", "topic": "Statistics", "question": "What does n represent in quartiles?", "answer": "The total number of values/data\n\nThe sample size or dataset size." },
            { "id": "m38", "topic": "Statistics", "question": "What is cumulative frequency?", "answer": "Add together all the prior frequencies\n\nA running total of frequencies up to each class." },
            { "id": "m39", "topic": "Statistics", "question": "How do you set up a cumulative frequency graph?", "answer": "x-axis: Class boundaries\ny-axis: Cumulative frequency\n\nPlot points at the upper class boundary." },
            { "id": "m40", "topic": "Statistics", "question": "How do you find the median on a cumulative frequency graph?", "answer": "1. Calculate n/2\n2. Find this value on the y-axis\n3. Read across to the curve\n4. Read down to find the corresponding x value" },
            { "id": "m41", "topic": "Statistics", "question": "What is the interquartile range (IQR)?", "answer": "IQR = Q3 - Q1\n\nMeasures the spread of the middle 50% of the data." },
            { "id": "m42", "topic": "Ratio & Proportion", "question": "What is the formula for direct proportion?", "answer": "y = kx\n\nWhere k is the constant of proportionality." },
            { "id": "m43", "topic": "Ratio & Proportion", "question": "What is the formula for indirect proportion?", "answer": "y = k/x\n\nAlso called inverse proportion." },
            { "id": "m44", "topic": "Similarity", "question": "For similar shapes, what is the length scale factor?", "answer": "k\n\nAll corresponding lengths are multiplied by k." },
            { "id": "m45", "topic": "Similarity", "question": "For similar shapes, what is the area scale factor?", "answer": "k²\n\nAreas are multiplied by k² when lengths are multiplied by k." },
            { "id": "m46", "topic": "Similarity", "question": "For similar shapes, what is the volume scale factor?", "answer": "k³\n\nVolumes are multiplied by k³ when lengths are multiplied by k." },
            { "id": "m47", "topic": "Indices", "question": "Indices law 1: What is aᵇ × aᶜ?", "answer": "aᵇ⁺ᶜ\n\nWhen multiplying with the same base, add the powers." },
            { "id": "m48", "topic": "Indices", "question": "Indices law 2: What is aᵇ ÷ aᶜ?", "answer": "aᵇ⁻ᶜ\n\nWhen dividing with the same base, subtract the powers." },
            { "id": "m49", "topic": "Indices", "question": "Indices law 3: What is (aᵇ)ᶜ?", "answer": "aᵇˣᶜ\n\nWhen raising a power to a power, multiply the indices." },
            { "id": "m50", "topic": "Indices", "question": "Indices law 4: What is a⁻ᵇ?", "answer": "1/aᵇ\n\nNegative powers give reciprocals." },
            { "id": "m51", "topic": "Indices", "question": "Indices law 5: What is (a/b)⁻ᶜ?", "answer": "bᶜ/aᶜ\n\nThe fraction flips and the power becomes positive." },
            { "id": "m52", "topic": "Indices", "question": "Indices law 6: What is a⁰?", "answer": "1\n\nAnything to the power of 0 equals 1 (except 0⁰)." },
            { "id": "m53", "topic": "Indices", "question": "Indices law 7: What is a¹?", "answer": "a\n\nAnything to the power of 1 equals itself." },
            { "id": "m54", "topic": "Indices", "question": "Indices law 8: What is a^(1/b)?", "answer": "ᵇ√a\n\nFractional power 1/b is the bth root." },
            { "id": "m55", "topic": "Indices", "question": "Indices law 9: What is a^(b/c)?", "answer": "(a^(1/c))ᵇ = (ᶜ√a)ᵇ\n\nTake the cth root, then raise to power b." },
            { "id": "m56", "topic": "Indices", "question": "Indices law 10: What is (ab)ᶜ?", "answer": "aᶜ × bᶜ\n\nDistribute the power to both terms." },
            { "id": "m57", "topic": "Surds", "question": "Surds law 1: What is √a × √b?", "answer": "√(a×b)\n\nMultiply the values inside the square roots." },
            { "id": "m58", "topic": "Surds", "question": "Surds law 2: What is √a ÷ √b?", "answer": "√(a/b)\n\nDivide the values inside the square roots." },
            { "id": "m59", "topic": "Surds", "question": "Surds law 3: What is √a × √a?", "answer": "a\n\nA square root multiplied by itself gives the original number." },
            { "id": "m60", "topic": "Surds", "question": "How do you rationalise 1/√a?", "answer": "Multiply by √a/√a to get √a/a\n\nThis removes the surd from the denominator." },
            { "id": "m61", "topic": "Surds", "question": "How do you rationalise 1/(√a + √b)?", "answer": "Multiply by (√a-√b)/(√a-√b) to get (√a-√b)/(a-b)\n\nUse difference of two squares (D.O.T.S.)." },
            { "id": "m62", "topic": "Inequalities", "question": "What does x < y mean?", "answer": "x is less than y\n(or y is greater than x)" },
            { "id": "m63", "topic": "Inequalities", "question": "What does x > y mean?", "answer": "x is greater than y\n(or y is less than x)" },
            { "id": "m64", "topic": "Inequalities", "question": "What does x ≤ y mean?", "answer": "x is less than or equal to y\n(or y is greater than or equal to x)" },
            { "id": "m65", "topic": "Inequalities", "question": "What does x ≥ y mean?", "answer": "x is greater than or equal to y\n(or y is less than or equal to x)" },
            { "id": "m66", "topic": "Inequalities", "question": "How do you represent ≥ or ≤ on a number line?", "answer": "Solid dot (filled circle)\n\nBecause the value is included." },
            { "id": "m67", "topic": "Inequalities", "question": "How do you represent < or > on a number line?", "answer": "Open dot (empty circle)\n\nBecause the value is not included." },
            { "id": "m68", "topic": "Probability", "question": "What does ! mean in the product rule for counting?", "answer": "Factorial\n\nn! = n × (n-1) × (n-2) × ... × 2 × 1" },
            { "id": "m69", "topic": "Statistics", "question": "For histograms, what is the relationship between frequency (f), class width (cw), and frequency density (fd)?", "answer": "fd = f / cw\n\nFrequency density equals frequency divided by class width." },
            { "id": "m70", "topic": "Statistics", "question": "How do you set up a histogram?", "answer": "x-axis: Class (continuous data)\ny-axis: Frequency density\n\nArea of bars represents frequency." },
            { "id": "m71", "topic": "Trigonometry", "question": "What does SoH CaH ToA stand for in trigonometry?", "answer": "Sin = Opposite/Hypotenuse\nCos = Adjacent/Hypotenuse\nTan = Opposite/Adjacent" },
            { "id": "m72", "topic": "Trigonometry", "question": "What is the formula for 3D trigonometry?", "answer": "a = √(x² + y² + z²)\n\n3D version of Pythagoras' theorem." },
            { "id": "m73", "topic": "Coordinate Geometry", "question": "How do you find the midpoint of a circle?", "answer": "((x₁ + x₂)/2, (y₁ + y₂)/2)\n\nAverage the x-coordinates and y-coordinates." },
            { "id": "m74", "topic": "Coordinate Geometry", "question": "What is the distance between two points?", "answer": "√((y₂-y₁)² + (x₂-x₁)²)\n\nDerived from Pythagoras' theorem." },
            { "id": "m75", "topic": "Coordinate Geometry", "question": "What is the equation of a circle with centre (0, 0)?", "answer": "x² + y² = r²\n\nWhere r is the radius." },
            { "id": "m76", "topic": "Coordinate Geometry", "question": "What is the equation of a circle with centre NOT at (0, 0)?", "answer": "(x-a)² + (y-b)² = r²\n\nWhere (a, b) is the centre and r is the radius." },
            { "id": "m77", "topic": "Circles", "question": "What is the area of a circle?", "answer": "πr²\n\nWhere r is the radius." },
            { "id": "m78", "topic": "Circles", "question": "What is the circumference of a circle?", "answer": "2πr or πd\n\nWhere r is the radius and d is the diameter." },
            { "id": "m79", "topic": "Circles", "question": "What is the formula for the length of an arc?", "answer": "(x/360) × 2πr\n\nWhere x is the angle in degrees." },
            { "id": "m80", "topic": "Circles", "question": "What is the formula for the area of a sector?", "answer": "(x/360) × πr²\n\nWhere x is the angle in degrees." },
            { "id": "m81", "topic": "Circles", "question": "What is the formula for the area of a segment?", "answer": "Area of sector - Area of triangle\n= (x/360 × πr²) - ½r²sin(x)" },
            { "id": "m82", "topic": "Probability", "question": "What is the 'and' rule in probability?", "answer": "P(A and B) = P(A) × P(B)\n\nFor independent events, multiply the probabilities." },
            { "id": "m83", "topic": "Probability", "question": "What is the 'or' rule in probability?", "answer": "P(A or B) = P(A) + P(B)\n\nFor mutually exclusive events, add the probabilities." },
            { "id": "m84", "topic": "Bounds", "question": "What is the upper bound for addition?", "answer": "UB + UB\n\nAdd the upper bounds of both measurements." },
            { "id": "m85", "topic": "Bounds", "question": "What is the upper bound for subtraction?", "answer": "UB - LB\n\nSubtract the lower bound from the upper bound." },
            { "id": "m86", "topic": "Bounds", "question": "What is the upper bound for multiplication?", "answer": "UB × UB\n\nMultiply the upper bounds of both measurements." },
            { "id": "m87", "topic": "Bounds", "question": "What is the upper bound for division?", "answer": "UB / LB\n\nDivide the upper bound by the lower bound." },
            { "id": "m88", "topic": "Bounds", "question": "What is the lower bound for addition?", "answer": "LB + LB\n\nAdd the lower bounds of both measurements." },
            { "id": "m89", "topic": "Bounds", "question": "What is the lower bound for subtraction?", "answer": "LB - UB\n\nSubtract the upper bound from the lower bound." },
            { "id": "m90", "topic": "Bounds", "question": "What is the lower bound for multiplication?", "answer": "LB × LB\n\nMultiply the lower bounds of both measurements." },
            { "id": "m91", "topic": "Bounds", "question": "What is the lower bound for division?", "answer": "LB / UB\n\nDivide the lower bound by the upper bound." },
            { "id": "m92", "topic": "Percentages", "question": "What is the general formula for simple interest?", "answer": "New Amount = Original Amount × Multiplier\n\noa × m = na" },
            { "id": "m93", "topic": "Percentages", "question": "What is the formula for compound interest?", "answer": "oa × mⁿ\n\nWhere n is the number of time periods." },
            { "id": "m94", "topic": "Percentages", "question": "What is the formula for percentage change?", "answer": "((New - Original) / Original) × 100\n= ((na - oa) / oa) × 100" },
            { "id": "m95", "topic": "Transformations", "question": "What information do you need to describe a rotation?", "answer": "1. Centre of rotation\n2. Direction of rotation (clockwise/anticlockwise)\n3. Angle of rotation" },
            { "id": "m96", "topic": "Transformations", "question": "What information do you need to describe a reflection?", "answer": "Line of reflection\n\nE.g., y = x, x = 0, y = -1" },
            { "id": "m97", "topic": "Transformations", "question": "What information do you need to describe a translation?", "answer": "Vector [x, y]\n\nWhere x is horizontal movement and y is vertical movement." },
            { "id": "m98", "topic": "Transformations", "question": "What information do you need to describe an enlargement?", "answer": "1. Centre of enlargement\n2. Scale factor\n\nNegative scale factors give an inverted image." },
            { "id": "m99", "topic": "Coordinate Geometry", "question": "What is the general equation of a line?", "answer": "y = mx + c\n\nWhere m is the gradient and c is the y-intercept." },
            { "id": "m100", "topic": "Coordinate Geometry", "question": "What is the formula for gradient?", "answer": "(y₂ - y₁) / (x₂ - x₁)\n\nChange in y divided by change in x." },
            { "id": "m101", "topic": "Coordinate Geometry", "question": "What is the y-intercept?", "answer": "(0, c)\n\nThe point where the line crosses the y-axis." },
            { "id": "m102", "topic": "Coordinate Geometry", "question": "What defines parallel lines?", "answer": "• Same gradient (m)\n• Different y-intercepts (c)\n\nThey never intersect." },
            { "id": "m103", "topic": "Coordinate Geometry", "question": "What defines perpendicular lines?", "answer": "• Different y-intercepts\n• Gradients are negative reciprocals: m₁ = -1/m₂\n\nThey intersect at 90°." },
            { "id": "m104", "topic": "Coordinate Geometry", "question": "What is the formula for the mid-point of a line?", "answer": "((x₁+x₂)/2, (y₁+y₂)/2)\n\nAverage the x and y coordinates." },
            { "id": "m105", "topic": "Coordinate Geometry", "question": "What is the general formula for dividing a line in a given ratio?", "answer": "((x₁q+x₂p)/(p+q), (y₁q+y₂p)/(p+q))\n\nWhere p:q is the ratio." },
            { "id": "m106", "topic": "Matrices", "question": "What are the dimensions of a matrix?", "answer": "Number of rows × Number of columns\n\nE.g., a 2×3 matrix has 2 rows and 3 columns." },
            { "id": "m107", "topic": "Matrices", "question": "For matrix addition, what must the matrices have?", "answer": "The same dimensions\n\nYou can only add matrices of the same size." },
            { "id": "m108", "topic": "Matrices", "question": "When multiplying a matrix by a scalar, what happens?", "answer": "Every element is multiplied by the scalar\n\nE.g., 3[1 2] = [3 6]\n      [3 4]   [9 12]" },
            { "id": "m109", "topic": "Matrices", "question": "When multiplying two matrices, what must be true?", "answer": "The number of columns in the first matrix must equal the number of rows in the second matrix\n\nE.g., (2×3) × (3×4) is valid." },
            { "id": "m110", "topic": "Matrices", "question": "After matrix multiplication, what dimensions will the resultant matrix have?", "answer": "Rows from first matrix × Columns from second matrix\n\nE.g., (2×3) × (3×4) = (2×4)" },
            { "id": "m111", "topic": "Matrices", "question": "What is the identity matrix?", "answer": "[1 0]\n[0 1]\n\nWhen you multiply any matrix by the identity matrix, you get the original matrix." },
            { "id": "m112", "topic": "Matrices", "question": "What are the transformation matrices for enlargements?", "answer": "[k 0]     Scale factor k\n[0 k]\n\n[1/k 0]   Scale factor 1/k\n[0 1/k]\n\n[-k 0]    Scale factor -k (with rotation)\n[0 -k]" },
            { "id": "m113", "topic": "Matrices", "question": "What are the transformation matrices for reflections?", "answer": "[-1 0]  = reflection in x = 0 (y-axis)\n[0 -1]\n\n[1 0]   = reflection in y = 0 (x-axis)\n[0 -1]\n\n[0 1]   = reflection in y = x\n[1 0]\n\n[0 -1]  = reflection in y = -x\n[-1 0]" },
            { "id": "m114", "topic": "Matrices", "question": "What are the transformation matrices for rotations?", "answer": "[-1 0]  = 180° rotation about (0,0)\n[0 -1]\n\n[0 -1]  = 90° anticlockwise about (0,0)\n[1 0]\n\n[0 1]   = 90° clockwise about (0,0)\n[-1 0]" },
            { "id": "m115", "topic": "Matrices", "question": "What does the unit square translate to?", "answer": "The identity matrix\n\nUnit square: (0,0), (1,0), (0,1), (1,1)" },
            { "id": "m116", "topic": "Matrices", "question": "How do you combine transformations using matrices?", "answer": "Method 1:\nStep 1: p × a = pa\nStep 2: pa × b = bap\n\nMethod 2:\nStep 1: b × a = ba\nStep 2: ba × p = bap\n\nTransformations are applied right to left." },
            { "id": "m117", "topic": "Vectors", "question": "What is a vector?", "answer": "A quantity that has both magnitude (size) and direction\n\nE.g., velocity, displacement, force." },
            { "id": "m118", "topic": "Vectors", "question": "What are vectors?", "answer": "Pathways\n\nThey represent movement from one point to another." },
            { "id": "m119", "topic": "Vectors", "question": "What are the two ways to represent vectors?", "answer": "1. Column vectors: [a]\n                    [b]\n\n2. Straight lines with arrows: AB with arrow on top" },
            { "id": "m120", "topic": "Vectors", "question": "What is the magnitude of vector [a, b]?", "answer": "|v| = √(a² + b²)\n\nUsing Pythagoras' theorem." },
            { "id": "m121", "topic": "Vectors", "question": "What can you say about parallel vectors?", "answer": "They are scalar multiples of each other\n\nE.g., if b = ka, then a and b are parallel." },
            { "id": "m122", "topic": "Sequences", "question": "What is the formula for an arithmetic sequence?", "answer": "Uₙ = a + (n - 1)d\n\nWhere a = first term, d = common difference, n = term number." },
            { "id": "m123", "topic": "Sequences", "question": "What is the formula for an arithmetic series?", "answer": "Sₙ = n/2 [2a + (n-1)d]\n\nor Sₙ = n/2 (first term + last term)" },
            { "id": "m124", "topic": "Algebra", "question": "What four things do you need when sketching a quadratic?", "answer": "1. General shape (∪ or ∩)\n2. Roots (x-intercepts)\n3. y-intercept\n4. Turning point (vertex)" },
            { "id": "m125", "topic": "Algebra", "question": "What are the five steps for solving quadratic inequalities?", "answer": "1. Solve the quadratic equation\n2. Sketch the graph (shape and roots)\n3. Get all terms on one side\n4. Identify regions that satisfy the inequality\n5. Write the solution as an inequality" },
            { "id": "m126", "topic": "Surds", "question": "How do you add surds?", "answer": "√a + √a = 2√a\n\nOnly like surds can be added (same number under the root)." },
            { "id": "m127", "topic": "Vectors", "question": "For vectors and translations [x, y], what do x and y represent?", "answer": "x: horizontal movement\n  • Positive = right\n  • Negative = left\n\ny: vertical movement\n  • Positive = up\n  • Negative = down" },
            { "id": "m128", "topic": "Statistics", "question": "What is the formula for mean in a frequency table?", "answer": "Mean = Σfx / Σf\n\nSum of (frequency × value) divided by sum of frequencies." },
            { "id": "m129", "topic": "Calculus", "question": "How do you estimate the gradient of a curve?", "answer": "1. Draw a tangent that touches the curve at the specific point\n2. Find the gradient of the tangent\n\nGradient = rise/run" },
            { "id": "m130", "topic": "Calculus", "question": "What is the general formula for differentiation?", "answer": "dy/dx = nx^(n-1)\n\nMultiply by the power, then reduce the power by 1." },
            { "id": "m131", "topic": "Calculus", "question": "What is the differentiation formula with an x coefficient?", "answer": "If y = ax^n, then dy/dx = anx^(n-1)\n\nThe coefficient stays and multiplies the new coefficient." },
            { "id": "m132", "topic": "Calculus", "question": "What indicates a maximum point in differentiation?", "answer": "Gradient changes from positive to negative\n\nThe curve goes up then down." },
            { "id": "m133", "topic": "Calculus", "question": "What indicates a minimum point in differentiation?", "answer": "Gradient changes from negative to positive\n\nThe curve goes down then up." },
            { "id": "m134", "topic": "Calculus", "question": "What are two characteristics of a decreasing function?", "answer": "1. Negative gradient\n2. f'(x) < 0\n\nThe function is going downwards." },
            { "id": "m135", "topic": "Calculus", "question": "What are two characteristics of an increasing function?", "answer": "1. Positive gradient\n2. f'(x) > 0\n\nThe function is going upwards." },
            { "id": "m136", "topic": "Calculus", "question": "How do you represent the second derivative?", "answer": "d²y/dx² or f''(x)\n\nThe derivative of the derivative." },
            { "id": "m137", "topic": "Calculus", "question": "If d²y/dx² is negative, what type of point is it?", "answer": "Maximum point\n\nThe curve is concave down (∩ shape)." },
            { "id": "m138", "topic": "Calculus", "question": "If d²y/dx² is positive, what type of point is it?", "answer": "Minimum point\n\nThe curve is concave up (∪ shape)." },
            { "id": "m139", "topic": "Calculus", "question": "What is velocity (v) in differentiation?", "answer": "• The rate at which displacement changes over time\n• Measured in m/s\n• Speed with direction (+/-)\n• v = ds/dt" },
            { "id": "m140", "topic": "Calculus", "question": "What is acceleration (a) in differentiation?", "answer": "• The rate at which velocity changes over time\n• Measured in m/s²\n• How velocity changes with direction (+/-)\n• a = dv/dt" },
            { "id": "m141", "topic": "Calculus", "question": "What is displacement (s) in differentiation?", "answer": "• The distance with direction (+/-)\n• Measured in metres (m)\n• Position relative to a starting point" },
            { "id": "m142", "topic": "Calculus", "question": "How are s, v and a related to time?", "answer": "s, v, and a are all expressed as functions of time (t)\n\nv = ds/dt\na = dv/dt = d²s/dt²" },
            { "id": "m143", "topic": "Set Theory", "question": "How is a set represented?", "answer": "A = {x, y, z}\n\nElements are listed inside curly brackets." },
            { "id": "m144", "topic": "Set Theory", "question": "What does x ∈ A mean?", "answer": "x is a member (element) of set A\n\n∈ means 'is an element of'" },
            { "id": "m145", "topic": "Set Theory", "question": "What does A = B mean?", "answer": "Set A is equal to set B\n\nThey have exactly the same members." },
            { "id": "m146", "topic": "Set Theory", "question": "What does n(A) = x mean?", "answer": "The number of elements in set A is x\n\nn(A) is the cardinality of set A." },
            { "id": "m147", "topic": "Set Theory", "question": "What does ∅ or {} represent?", "answer": "An empty set (null set)\n\nA set with no elements." },
            { "id": "m148", "topic": "Set Theory", "question": "What does ξ represent?", "answer": "Universal set\n\nAll the elements being discussed in a particular problem." },
            { "id": "m149", "topic": "Set Theory", "question": "What does B ⊂ A mean?", "answer": "B is a subset of A\n\nEvery member in B is also a member in A." },
            { "id": "m150", "topic": "Set Theory", "question": "What does A' mean?", "answer": "The complement of set A\n\nAll elements in the universal set that are NOT in A." },
            { "id": "m151", "topic": "Set Theory", "question": "What does A ∩ B mean?", "answer": "Intersection of A and B\n\nThe set of elements that are in BOTH A and B." },
            { "id": "m152", "topic": "Set Theory", "question": "What does A ∪ B mean?", "answer": "Union of sets A and B\n\nThe set of elements that are in A OR B OR both." },
            { "id": "m153", "topic": "Polygons", "question": "What is the formula for the sum of interior angles in a polygon?", "answer": "(n - 2) × 180°\n\nWhere n is the number of sides." },
            { "id": "m154", "topic": "Polygons", "question": "What can you say about exterior angles of a polygon?", "answer": "• All exterior angles sum to 360°\n• Each exterior angle = 360° / number of sides\n\n(For regular polygons)" }
        ]
    },
    {
        subject: "Biology",
        cards: [
            { id: "b1", topic: "Cells", question: "What are the differences between mitosis and meiosis?", answer: "Mitosis: 1 division, 2 identical diploid cells, for growth/repair\n\nMeiosis: 2 divisions, 4 different haploid cells, for gamete production, includes crossing over" },
            { id: "b2", topic: "Cells", question: "Describe the structure and function of mitochondria.", answer: "Double membrane structure with folded inner membrane (cristae).\n\nSite of aerobic respiration - produces ATP through oxidative phosphorylation. Contains own DNA." },
            { id: "b3", topic: "Cells", question: "What is the function of ribosomes?", answer: "Site of protein synthesis (translation).\n\nFound free in cytoplasm or on rough endoplasmic reticulum. Made of rRNA and protein." },
            { id: "b4", topic: "Genetics", question: "What is codominance? Give an example.", answer: "When both alleles are equally expressed in the phenotype.\n\nExample: Blood group AB - both A and B antigens are expressed on red blood cells." },
            { id: "b5", topic: "Genetics", question: "Explain the process of transcription.", answer: "1. DNA helicase unwinds DNA double helix\n2. RNA polymerase binds to promoter region\n3. Complementary mRNA strand synthesised (U pairs with A)\n4. mRNA detaches and exits through nuclear pore" },
            { id: "b6", topic: "Genetics", question: "What is translation?", answer: "mRNA is read by ribosomes in the cytoplasm.\n\ntRNA brings amino acids matching each codon.\nPeptide bonds form between amino acids to create a polypeptide chain." },
            { id: "b7", topic: "Genetics", question: "What causes genetic variation in meiosis?", answer: "1. Crossing over - exchange of genetic material between homologous chromosomes\n2. Independent assortment - random orientation of chromosome pairs\n3. Random fertilisation" },
            { id: "b8", topic: "Ecology", question: "What is the difference between a food chain and a food web?", answer: "Food chain: Linear sequence showing energy flow from one organism to the next\n\nFood web: Interconnected food chains showing complex feeding relationships in an ecosystem" },
            { id: "b9", topic: "Ecology", question: "Why is only ~10% of energy transferred between trophic levels?", answer: "Energy is lost through:\n• Respiration (heat)\n• Excretion (waste products)\n• Movement\n• Parts not eaten (bones, roots)" },
            { id: "b10", topic: "Homeostasis", question: "How does ADH regulate water balance?", answer: "Low water → hypothalamus detects → pituitary releases more ADH → collecting ducts more permeable → more water reabsorbed → concentrated urine\n\nHigh water → opposite occurs" },
            { id: "b11", topic: "Homeostasis", question: "How is blood glucose regulated?", answer: "High glucose: Pancreas releases insulin → liver converts glucose to glycogen → blood glucose falls\n\nLow glucose: Pancreas releases glucagon → liver converts glycogen to glucose → blood glucose rises" },
            { id: "b12", topic: "Respiration", question: "Write the word equation for aerobic respiration.", answer: "Glucose + Oxygen → Carbon Dioxide + Water + Energy (ATP)\n\nC₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP" },
            // Source: https://knowt.com/flashcards/4b82b649-cc6e-462a-ab44-89a0e6d25b4a (First 100)
            { id: "b13", topic: "Cell Structure", question: "What are the parts of an animal (and plant) cell?", answer: "Nucleus, Cytoplasm, Cell membrane, Mitochondria" },
            { id: "b14", topic: "Cell Structure", question: "What are parts of a plant cell?", answer: "Rigid cell wall, Large vacuole, Chloroplasts (plus nucleus, cytoplasm, cell membrane and mitochondria)" },
            { id: "b15", topic: "Cell Structure", question: "What does the nucleus do?", answer: "Contains DNA that controls what the cell does" },
            { id: "b16", topic: "Cell Structure", question: "What does the cytoplasm do?", answer: "Its a gel-like substance where most of the chemical reactions happen" },
            { id: "b17", topic: "Cell Structure", question: "What does the cell membrane do?", answer: "Holds the cell together and controls what goes in and out" },
            { id: "b18", topic: "Cell Structure", question: "What does the mitochondria do?", answer: "This is where most of the reactions for respiration take place. Respiration releases energy that the cell needs to work." },
            { id: "b19", topic: "Cell Structure", question: "What does the rigid cell wall do?", answer: "It is made up of cellulose and it gives support for the cell" },
            { id: "b20", topic: "Cell Structure", question: "What does the large vacuole do?", answer: "Contains cell sap, a weak solution of sugar and salts" },
            { id: "b21", topic: "Cell Structure", question: "What do chloroplasts do?", answer: "This is where photosynthesis occurs. They contain a green substance called chlorophyll." },
            { id: "b22", topic: "Cell Structure", question: "What are the features of a bacteria cell?", answer: "Chromosomal DNA, Plasmids, Flagellum, Cell wall" },
            { id: "b23", topic: "Cell Structure", question: "What is chromosomal DNA?", answer: "Chromosomal DNA controls the cells activities and replication. It floats free in the cytoplasm." },
            { id: "b24", topic: "Cell Structure", question: "What are plasmids?", answer: "Plasmids are small loops of extra DNA that aren't part of the chromosome. Plasmids contain genes for things like drug resistance and can be passed between bacteria." },
            { id: "b25", topic: "Cell Structure", question: "What is the flagellum?", answer: "The flagellum is a long, hair-like structure that rotates to make the bacterium move." },
            { id: "b26", topic: "Cell Structure", question: "What does the cell wall do?", answer: "Support the cell" },
            { id: "b27", topic: "Microscopy", question: "What is magnification?", answer: "How much bigger the image is that the specimen" },
            { id: "b28", topic: "Microscopy", question: "How do you work out magnification?", answer: "length of image / length of specimen" },
            { id: "b29", topic: "Microscopy", question: "What is the difference between light microscopes and electron microscopes?", answer: "Light microscopes let us see things like the nuclei, chloroplasts and mitochondria. Electron microscopes let us see much smaller things in more detail like the internal structure of mitochondria and chloroplasts and even tinier things like plasmids." },
            { id: "b30", topic: "Genetics", question: "What is DNA?", answer: "DNA is the complex chemical that carries genetic information. DNA is found in chromosomes which are found in the nucleus of most cells." },
            { id: "b31", topic: "Genetics", question: "What is the structure of DNA? (6 marker)", answer: "-A DNA molecule has two strands coiled together in the shape of a double helix.\n-The two strands are hold together by chemicals called bases. The four bases are adenine, thymine, guanine and cytosine.\n-The bases are paired, and they always pair up in the same way; A-T and C-G. This is called base pairing.\n-The base pairs are joined together by weak hydrogen bonds." },
            { id: "b32", topic: "Genetics", question: "What is a gene?", answer: "A gene is a short piece of DNA that codes for a specific protein. You have genes for hair structure, eye colour enzymes and every other protein in your body." },
            { id: "b33", topic: "Genetics", question: "Who discovered the structure of DNA?", answer: "-Rosalind Franklin and Maurice Wilkins worked out DNA had a helical structure by directing beams of X-rays onto crystallised DNA\n-James Watson and Francis Crick used these ideas along with the idea the amount of adenine+guanine matched the amount of thymine+cytosine to make a model of the DNA molecule." },
            { id: "b34", topic: "Genetics", question: "What would be a practical to extract DNA? (6 marker)", answer: "1. Mash fruit (e.g kiwi) with salty water and detergent to break open cells.\n2. Add protease enzyme to break up proteins in cell membranes.\n3. Add ice cold ethanol carefully. The ethanol makes the DNA separate from the liquid so it is easy to lift out." },
            { id: "b35", topic: "Genetics", question: "How does a cell make proteins?", answer: "By stringing amino acids together in a particular order. The order of bases in a gene tells cells in what order to put the amino acids together. Each set of three bases (triplet) codes for a particular amino acid." },
            { id: "b36", topic: "Genetics", question: "What can DNA determine?", answer: "Which genes are switched on or off and so which proteins the cell produces e.g keratin. That in turn determines what type of cell it is e.g. red blood cell, skin cell." },
            { id: "b37", topic: "Genetics", question: "What are proteins made by?", answer: "Proteins are made in the cell by organelles called ribosomes." },
            { id: "b38", topic: "Genetics", question: "Why does the cell need mRNA?", answer: "DNA is too big to leave the nucleus. mRNA is a shorter, single-strand messenger copy that carries the code to the ribosome. It uses uracil (U) instead of thymine (T)." },
            { id: "b39", topic: "Genetics", question: "What happens during transcription?", answer: "1. DNA unwinds in the nucleus.\n2. One strand acts as a template.\n3. Complementary mRNA is formed (U pairs with A).\n4. mRNA moves out of the nucleus into the cytoplasm." },
            { id: "b40", topic: "Genetics", question: "What happens during translation?", answer: "1. mRNA attaches to a ribosome in the cytoplasm.\n2. Ribosome reads codons (triplets).\n3. tRNA brings matching amino acids.\n4. Amino acids join to form a polypeptide (protein) chain." },
            { id: "b41", topic: "Genetics", question: "What do mutations do?", answer: "A mutation is a change in an organisms DNA base sequence. This may change the amino acid that is added to the chain during translation on the ribosome." },
            { id: "b42", topic: "Genetics", question: "What could a harmful mutation change do?", answer: "A harmful mutation could cause a genetic disorder, for example, cystic fibrosis" },
            { id: "b43", topic: "Genetics", question: "What can a beneficial mutation do?", answer: "A beneficial mutation could produce a new characteristic that is beneficial to an organism e.g. a mutation in genes on bacterial plasmids can make them resistant to antibiotics" },
            { id: "b44", topic: "Genetics", question: "What can neutral mutations do?", answer: "Some mutations are neither harmful nor beneficial e.g. they don't affect a proteins function" },
            { id: "b45", topic: "Proteins", question: "What does the haemoglobin (in blood) do?", answer: "Carries oxygen to red blood cells. They have a globular shape" },
            { id: "b46", topic: "Proteins", question: "What do hormones do?", answer: "Hormones are transported in blood to target cells. They have a globular shape" },
            { id: "b47", topic: "Proteins", question: "What does the collagen do?", answer: "The collagen is in tendons and ligaments. Ligaments hold bones together and tendons attach muscles to bones." },
            { id: "b48", topic: "Proteins", question: "Why does the shape of a protein matter?", answer: "The shape affects the way it works. Amino acid sequence determines the 3D shape (globular or fibrous)." },
            { id: "b49", topic: "Enzymes", question: "Why might a gene mutation change enzyme activity?", answer: "A mutation changes the DNA base sequence → changes amino acid sequence → changes shape of the active site. If the active site shape changes, the substrate may no longer fit." },
            { id: "b50", topic: "Enzymes", question: "What are enzymes?", answer: "Enzymes are biological catalysts that control reactions in the body." },
            { id: "b51", topic: "Enzymes", question: "What is a catalyst?", answer: "A substrate which increases the speed of a reaction without being changed or used up in the reaction." },
            { id: "b52", topic: "Enzymes", question: "What is meant by the 'lock and key' hypothesis?", answer: "The enzyme has an active site with a specific shape. The substrate (key) must fit into the active site (lock) for a reaction to occur." },
            { id: "b53", topic: "Enzymes", question: "How to measure reaction rate with amylase and starch?", answer: "Mix amylase and starch. Every 30s, add a drop to iodine solution. Record when iodine stops turning blue-black (starch broken down)." },
            { id: "b54", topic: "Enzymes", question: "What variables affect enzyme controlled reactions?", answer: "Temperature, pH, and Substrate concentration." },
            { id: "b55", topic: "Enzymes", question: "What happens at lower temperatures to molecules?", answer: "Molecules move slower (less kinetic energy), so substrate fits into active site less frequently. Reaction is slower." },
            { id: "b56", topic: "Enzymes", question: "What is the optimum temperature?", answer: "The temperature where the enzyme works at the fastest rate." },
            { id: "b57", topic: "Enzymes", question: "What happens to the active site at very high temperatures?", answer: "The active site breaks up and the enzyme is denatured (shape changes permanently)." },
            { id: "b58", topic: "Enzymes", question: "How does pH affect an enzyme?", answer: "Extreme pH interferes with bonds holding the enzyme together, changing the active site shape and denaturing the enzyme." },
            { id: "b59", topic: "Enzymes", question: "How does substrate concentration affect an enzyme?", answer: "Higher concentration = faster reaction (more collisions). Eventually plateaus when all active sites are full." },
            { id: "b60", topic: "Genetics", question: "What is the human genome project?", answer: "International collaboration to decode the entire human DNA sequence, completed in 2003." },
            { id: "b61", topic: "Genetics", question: "What are the positives of the human genome project?", answer: "-Predict and prevent diseases\n-Develop new medicines\n-Accurate diagnoses\n-Improved forensic science" },
            { id: "b62", topic: "Genetics", question: "What are the negatives of the human genome project?", answer: "-Increased stress (knowing risks)\n-Gene-ism (pressure on reproduction)\n-Discrimination by employers/insurers" },
            { id: "b63", topic: "Genetics", question: "What is genetic engineering?", answer: "Removing a gene from one organism and inserting it into the DNA of another organism." },
            { id: "b64", topic: "Genetics", question: "What are the steps of genetic engineering?", answer: "1. Cut gene with restriction enzymes.\n2. Cut plasmid with enzymes.\n3. Mix gene and plasmid.\n4. Join with ligase enzymes.\n5. Insert plasmid into bacterium." },
            { id: "b65", topic: "Genetics", question: "How can genetic engineering help reduce vitamin A deficiency?", answer: "Golden Rice is GM rice containing genes to produce beta-carotene, which the body converts to Vitamin A." },
            { id: "b66", topic: "Genetics", question: "How can genetic engineering help produce human insulin?", answer: "Human insulin gene inserted into bacteria. Bacteria multiply and produce insulin cheaply for diabetics." },
            { id: "b67", topic: "Genetics", question: "How can genetic engineering increase crop yield?", answer: "GM crops can be made resistant to herbicides, allowing farmers to kill weeds without harming the crop." },
            { id: "b68", topic: "Cell Division", question: "What are diploid cells?", answer: "Cells that have two sets of chromosomes. Human body cells are diploid." },
            { id: "b69", topic: "Cell Division", question: "What is mitosis?", answer: "Cell division for growth and repair. Produces two genetically identical diploid daughter cells." },
            { id: "b70", topic: "Cell Division", question: "What are situations where mitosis is used?", answer: "-Growth\n-Repairing damaged tissue\n-Asexual reproduction" },
            { id: "b71", topic: "Reproduction", question: "What is asexual reproduction?", answer: "Production of offspring from a single parent without fertilisation. Offspring are clones (genetically identical)." },
            { id: "b72", topic: "Reproduction", question: "What are gametes?", answer: "Sex cells (sperm and egg). They are haploid (one set of chromosomes)." },
            { id: "b73", topic: "Reproduction", question: "Why are gametes haploid?", answer: "So when they fuse at fertilisation, the zygote has the correct diploid number (two sets)." },
            { id: "b74", topic: "Cell Division", question: "What is meiosis?", answer: "Cell division that produces gametes. Produces four non-identical haploid cells." },
            { id: "b75", topic: "Reproduction", question: "What happens during sexual reproduction?", answer: "Two gametes fuse to form a zygote (fertilisation). Produces variation in offspring." },
            { id: "b76", topic: "Cloning", question: "What is cloning?", answer: "A type of asexual reproduction that produces genetically identical organisms." },
            { id: "b77", topic: "Cloning", question: "How is cloning done (Dolly the sheep)?", answer: "1. Nucleus removed from egg cell.\n2. Diploid nucleus from body cell inserted.\n3. Electric shock stimulates division.\n4. Embryo implanted into surrogate." },
            { id: "b78", topic: "Cloning", question: "What are the advantages of cloning?", answer: "-Preserve good characteristics\n-Help shortage of organs\n-Preserve endangered species" },
            { id: "b79", topic: "Cloning", question: "What are the disadvantages of cloning?", answer: "-Reduced gene pool\n-Cloned mammals may have health problems\n-Ethical concerns" },
            { id: "b80", topic: "Stem Cells", question: "What are stem cells?", answer: "Undifferentiated cells that can divide to produce many types of cell." },
            { id: "b81", topic: "Stem Cells", question: "What are embryonic stem cells?", answer: "Taken from embryos. Can differentiate into ANY cell type. Easy to extract." },
            { id: "b82", topic: "Stem Cells", question: "What are adult stem cells?", answer: "Found in tissues like bone marrow. Can only differentiate into certain cell types (e.g., blood cells)." },
            { id: "b83", topic: "Stem Cells", question: "What are the issues with embryonic stem cells?", answer: "-Destroys the embryo (ethical issue - right to life)\n-Risk of rejection if not matched" },
            { id: "b84", topic: "Respiration", question: "What is respiration?", answer: "The process of releasing energy from glucose. Occurs in all living cells." },
            { id: "b85", topic: "Respiration", question: "What is the energy from respiration used for?", answer: "Growth, movement, muscle contraction, maintaining body temperature, building molecules." },
            { id: "b86", topic: "Respiration", question: "What is aerobic respiration?", answer: "Respiration using oxygen. Releases more energy.\nGlucose + Oxygen → Carbon Dioxide + Water" },
            { id: "b87", topic: "Respiration", question: "What is anaerobic respiration?", answer: "Respiration without oxygen. Releases less energy. Produces lactic acid.\nGlucose → Lactic Acid" },
            { id: "b88", topic: "Respiration", question: "When is anaerobic respiration used?", answer: "During intense exercise when oxygen cannot be delivered fast enough to muscles." },
            { id: "b89", topic: "Respiration", question: "What is the disadvantage of anaerobic respiration?", answer: "-Less energy released\n-Lactic acid builds up causing cramps" },
            { id: "b90", topic: "Respiration", question: "What is EPOC?", answer: "Excess Post-exercise Oxygen Consumption. Oxygen needed to break down lactic acid after exercise." },
            { id: "b91", topic: "Transport", question: "What is diffusion?", answer: "Net movement of particles from high to low concentration." },
            { id: "b92", topic: "Transport", question: "Why is diffusion needed?", answer: "For gas exchange (oxygen in, CO2 out) and nutrient uptake (glucose)." },
            { id: "b93", topic: "Exercise", question: "Why do you respire more during exercise?", answer: "Muscles contract more → need more energy → increased respiration rate." },
            { id: "b94", topic: "Exercise", question: "Why does breathing rate increase during exercise?", answer: "To get more oxygen into the blood and remove CO2 more quickly." },
            { id: "b95", topic: "Exercise", question: "How do you calculate cardiac output?", answer: "Cardiac output = heart rate × stroke volume" },
            { id: "b96", topic: "Photosynthesis", question: "What is photosynthesis?", answer: "Process by which plants make glucose using light energy." },
            { id: "b97", topic: "Photosynthesis", question: "What is the word equation for photosynthesis?", answer: "Carbon dioxide + Water → Glucose + Oxygen" },
            { id: "b98", topic: "Photosynthesis", question: "Where does photosynthesis happen?", answer: "In chloroplasts (mainly in leaf cells). Chlorophyll absorbs light energy." },
            { id: "b99", topic: "Photosynthesis", question: "What are limiting factors of photosynthesis?", answer: "Light intensity, CO2 concentration, Temperature." },
            { id: "b100", topic: "Photosynthesis", question: "How are leaves adapted for photosynthesis?", answer: "-Broad surface area\n-Thin (short diffusion path)\n-Chloroplasts near top\n-Stomata for gas exchange" },
            { id: "b101", topic: "Photosynthesis", question: "Where does photosynthesis happen?", answer: "In the leaves of all green plants. It happens inside the chloroplasts. They contain chlorophyll which absorbs energy in sunlight and uses it to convert carbon dioxide and water into glucose." },
            { id: "b102", topic: "Photosynthesis", question: "What is the equation for photosynthesis?", answer: "Carbon dioxide + water → glucose + oxygen\n(Energy from sunlight absorbed by chlorophyll)" },
            { id: "b103", topic: "Photosynthesis", question: "How are leaves adapted for photosynthesis?", answer: "-Leaves are BROAD so they have a large surface area exposed to light\n-Leaves contain lots of CHLOROPHYLL in chloroplasts to absorb sunlight\n-Leaves have little holes called STOMATA. That open and close to let gases like CO2 and O2 in and out. They also allow water vapour to escape which is known as transpiration." },
            { id: "b104", topic: "Photosynthesis", question: "What are the stomata in leaves for?", answer: "The stomata in the leaf surface allow carbon dioxide needed for photosynthesis to diffuse into the leaf. They also allow oxygen and water vapour produced by photosynthesis to diffuse out of the leaf." },
            { id: "b105", topic: "Photosynthesis", question: "What might affect the rate of photosynthesis (limiting factors)?", answer: "-Light intensity (night = no light)\n-Concentration of CO2\n-Temperature (winter = cold)" },
            { id: "b106", topic: "Photosynthesis", question: "What might be an experiment to work out the ideal condition for photosynthesis in a plant?", answer: "-Place a plant e.g Pondweed in a flask.\n-Add some water\n-Change the variable you testing (e.g. light distance)\n-Count bubbles of oxygen given off or use a gas syringe.\n-Control other variables like temp." },
            { id: "b107", topic: "Photosynthesis", question: "How does light effect photosynthesis?", answer: "-Light provides energy needed for photosynthesis\n-As the light level is raised, the rate of photosynthesis increases steadily up to a certain point\n-Beyond this point, light intensity won't make any difference." },
            { id: "b108", topic: "Photosynthesis", question: "How does carbon dioxide effect photosynthesis?", answer: "-CO2 is a raw material needed for photosynthesis\n-CO2 concentration will increase rate up to a certain point, after which other limiting factors effect the rate." },
            { id: "b109", topic: "Photosynthesis", question: "How does temperature effect photosynthesis?", answer: "-If too low, enzymes work slowly\n-If too hot (around 45°C), enzymes differ denatured" },
            { id: "b110", topic: "Transport", question: "What is osmosis?", answer: "Osmosis is the net movement of water molecules across a partially permeable membrane from a region of high water concentration to a region of lower water concentration" },
            { id: "b111", topic: "Transport", question: "What is a partially permeable membrane?", answer: "A membrane that has very small holes that only small molecules such as water can pass through them and bigger molecules such as sugar molecules cant." },
            { id: "b112", topic: "Transport", question: "How does osmosis work in a solution of sugar molecules and diluted sugar molecules?", answer: "Water molecules move from the dilute sugar solution (high water conc.) to the concentrated sugar solution (low water conc.) through the membrane." },
            { id: "b113", topic: "Transport", question: "How can potato strips be used to investigate osmosis?", answer: "-Cut identical potato cylinders.\n-Place in beakers with different sugar solutions (pure water vs concentrated).\n-Measure mass/length before and after. Increase = water in (osmosis). Decrease = water out." },
            { id: "b114", topic: "Scientific Method", question: "What is a dependent variable?", answer: "The variable you measure in an experiment." },
            { id: "b115", topic: "Scientific Method", question: "What is an independent variable?", answer: "The variable that you change in an experiment." },
            { id: "b116", topic: "Plants", question: "How are root hair cells adapted to take in water by osmosis?", answer: "-Long 'hairs' stick out into soil\n-Large surface area\n-Higher concentration of water in soil than inside plant means water enters by osmosis." },
            { id: "b117", topic: "Plants", question: "How do root hairs take in minerals?", answer: "-Using active transport.\n-Minerals move against concentration gradient from low conc. in soil to high conc. in root." },
            { id: "b118", topic: "Transport", question: "What is active transport?", answer: "Active transport uses energy from respiration to help the plant pull minerals into the root hair against the concentration gradient." },
            { id: "b119", topic: "Transport", question: "What are the types of transport?", answer: "-Diffusion: High to low conc (No energy)\n-Active transport: Low to high conc (Energy needed)\n-Osmosis: Water diffusion" },
            { id: "b120", topic: "Plants", question: "What is transpiration?", answer: "Transpiration is the evaporation of water from inside leaves out into the air. It causes water to move up the plant from the roots." },
            { id: "b121", topic: "Plants", question: "What do xylem tubes do?", answer: "Xylem tubes transport water and minerals from the root to the rest of the plant e.g the leaves." },
            { id: "b122", topic: "Plants", question: "What are phloem tubes?", answer: "Phloem tubes transport sugars from the leaves (where they're made) to growing and storing tissues (translocation)." },
            { id: "b123", topic: "Plants", question: "What happens during transpiration?", answer: "-Water evaporates from leaves causing a shortage.\n-Water is drawn up xylem vessels to replace it.\n-This pulls more water up from roots (transpiration stream)." },
            { id: "b124", topic: "Plants", question: "How do minerals and water travel through a plant?", answer: "-In roots from soil water.\n-Up xylem to rest of plant.\n-Glucose (as sucrose) transported in phloem." },
            { id: "b125", topic: "Ecology", question: "What is a habitat?", answer: "A habitat is the place where an organism lives" },
            { id: "b126", topic: "Ecology", question: "What can you use to measure organism distribution?", answer: "-Pooters\n-Pitfall traps\n-Sweep nets\n-Pond nets" },
            { id: "b127", topic: "Ecology", question: "What are pooters?", answer: "Jars with tubes for sucking up ground insects. Mesh prevents inhaling the insect." },
            { id: "b128", topic: "Ecology", question: "What are pitfall traps?", answer: "Steep-sided containers sunk in ground to catch small ground-living animals overnight." },
            { id: "b129", topic: "Ecology", question: "What are sweep nets/pond nets?", answer: "Nets lined with cloth to sweep through long grass or ponds to calculate insects." },
            { id: "b130", topic: "Ecology", question: "What is a quadrat?", answer: "A square frame enclosing a known area used to sample plants or slow-moving animals." },
            { id: "b131", topic: "Ecology", question: "How would you use a quadrat?", answer: "-Place randomly in sample area.\n-Count organisms.\n-Repeat and calculate average." },
            { id: "b132", topic: "Ecology", question: "How would you calculate total population using quadrats?", answer: "Total population = Average per quadrat × (Total area / Quadrat area)" },
            { id: "b133", topic: "Ecology", question: "What environmental factors affect distribution?", answer: "-Temperature (Thermometer)\n-Light intensity (Light meter)\n-pH of soil (pH probe)" },
            { id: "b134", topic: "Evolution", question: "What are fossils?", answer: "The preserved traces or remains of organisms that lived thousands or millions of years ago" },
            { id: "b135", topic: "Evolution", question: "Why is the fossil record not complete?", answer: "-Fossils don't always form\n-Soft tissue decays\n-Many fossils haven't been found yet" },
            { id: "b136", topic: "Evolution", question: "What are the three ways fossils can be formed?", answer: "1. Gradual replacement by minerals (teeth/bones)\n2. Casts and impressions (footprints)\n3. Preservation (no decay conditions e.g. amber/ice)" },
            { id: "b137", topic: "Evolution", question: "What do fossils found in rock layers show?", answer: "-What creatures looked like\n-How long ago they existed\n-How they have evolved over time" },
            { id: "b138", topic: "Evolution", question: "How does the pentadactyl limb provide evidence for evolution?", answer: "Many species share a limb with 5 digits with similar bone structure but different functions (bat wing vs human hand), suggesting a common ancestor." },
            { id: "b139", topic: "Growth", question: "How can you measure an organisms growth?", answer: "-Size (height, weight)\n-Wet mass (including water)\n-Dry mass (no water)" },
            { id: "b140", topic: "Growth", question: "Why do plants and animals grow and develop?", answer: "-Cell differentiation (specialisation)\n-Cell division (mitosis)\n-Cell elongation (plants expanding)" },
            { id: "b141", topic: "Growth", question: "How does growth in animals happen?", answer: "Mainly cell division. Animals grow when young and stop when they reach adulthood." },
            { id: "b142", topic: "Growth", question: "How do plants grow?", answer: "Continuously. They continue to differentiate to develop new parts like leaves/roots throughout life." },
            { id: "b143", topic: "Growth", question: "How do people use percentile charts?", answer: "To verify if someone (e.g. a baby) is growing faster or slower than the normal rate for their age." },
            { id: "b144", topic: "Growth", question: "How does growth in plants happen?", answer: "Cell division at tip, followed by cell elongation. Cells at tip are stem cells." },
            { id: "b145", topic: "Growth", question: "Comparing plant vs animal growth", answer: "Plants: continuous growth at tips. Animals: rapid early growth, stops at maturity." },
            { id: "b146", topic: "Organ Systems", question: "What is tissue?", answer: "A group of similar cells that work together to carry out a particular function." },
            { id: "b147", topic: "Organ Systems", question: "What are organs?", answer: "A group of different tissues working together (e.g. heart)." },
            { id: "b148", topic: "Organ Systems", question: "What is an organ system?", answer: "A group of organs working together (e.g. circulatory system)." },
            { id: "b149", topic: "Heart", question: "What is the heart?", answer: "An organ made of muscle (and valves) that pumps blood." },
            { id: "b150", topic: "Heart", question: "Structure of the heart", answer: "4 Chambers (Left/Right Atria/Ventricles). Left side pumps oxygenated blood to body (thick wall). Right side pumps deoxygenated to lungs." },
            { id: "b151", topic: "Heart", question: "What does the pulmonary artery do?", answer: "Carries deoxygenated blood from the heart to the lungs" },
            { id: "b152", topic: "Heart", question: "What does the vena cava do?", answer: "Brings deoxygenated blood from the body to the heart (Right Atrium)" },
            { id: "b153", topic: "Heart", question: "What does the left atrium do?", answer: "Receives oxygenated blood from the lungs (via pulmonary vein)" },
            { id: "b154", topic: "Heart", question: "What do the valves do?", answer: "Prevent backflow of blood" },
            { id: "b155", topic: "Heart", question: "What does the left ventricle do?", answer: "Pump blood around body via aorta. Thickest wall." },
            { id: "b156", topic: "Heart", question: "What does the aorta do?", answer: "Carries oxygenated blood from heart to body" },
            { id: "b157", topic: "Heart", question: "What does the pulmonary vein do?", answer: "Brings oxygenated blood from lungs to heart" },
            { id: "b158", topic: "Circulation", question: "What is the circulatory system?", answer: "Heart, blood vessels and blood. Transports materials." },
            { id: "b159", topic: "Blood", question: "What do red blood cells do?", answer: "Carry oxygen. Biconcave shape (surface area), contain haemoglobin, no nucleus." },
            { id: "b160", topic: "Blood", question: "What happens to haemoglobin in lungs?", answer: "Combines with oxygen to form oxyhaemoglobin. Reverses in tissues." },
            { id: "b161", topic: "Blood", question: "What do white blood cells do?", answer: "Defend against disease. Produce antibodies and antitoxins, perform phagocytosis." },
            { id: "b162", topic: "Blood", question: "What if white blood cell count is low/high?", answer: "Low: Risk of infection. High: Fighting infection or leukaemia." },
            { id: "b163", topic: "Blood", question: "What are platelets?", answer: "Cell fragments that help blood clot to block wounds." },
            { id: "b164", topic: "Blood", question: "What does the plasma do?", answer: "Liquid part of blood. Carries cells, CO2, glucose, urea, hormones." },
            { id: "b165", topic: "Blood", question: "What is urea?", answer: "Waste product from liver, transported to kidneys for excretion." },
            { id: "b166", topic: "Circulation", question: "What are the three types of blood vessels?", answer: "Arteries (Away), Veins (To heart), Capillaries (Exchange)" },
            { id: "b167", topic: "Circulation", question: "Features of arteries", answer: "Carry blood away under high pressure. Thick, elastic walls, small lumen." },
            { id: "b168", topic: "Circulation", question: "Features of capillaries", answer: "Tiny, one cell thick walls for exchange of substances (diffusion). Permeable." },
            { id: "b169", topic: "Circulation", question: "Features of veins", answer: "Carry blood to heart at low pressure. Thinner walls, large lumen, valves to stop backflow." },
            { id: "b170", topic: "Circulation", question: "Roles of vessels summary", answer: "Arteries: Oxygenated to body (except pulmonary). Veins: Deoxygenated to heart (except pulmonary). Capillaries: Exchange." },
            { id: "b171", topic: "Digestion", question: "What catalyses food breakdown?", answer: "Enzymes" },
            { id: "b172", topic: "Digestion", question: "Main digestive enzymes", answer: "Amylase (Carbs → Sugars), Protease (Proteins → Amino Acids), Lipase (Fats → Fatty Acids + Glycerol)" },
            { id: "b173", topic: "Digestion", question: "How does digestive system work (summary)?", answer: "Mouth (Amylase), Stomach (Pepsin/Acid), Small Intestine (Absorption/Enzymes), Large Intestine (Water absorption)." },
            { id: "b174", topic: "Digestion", question: "Carbohydrases", answer: "Digest carbohydrates" },
            { id: "b175", topic: "Digestion", question: "Proteases", answer: "Digest proteins" },
            { id: "b176", topic: "Digestion", question: "Lipases", answer: "Digest fats" },
            { id: "b177", topic: "Digestion", question: "Role of bile", answer: "Neutralises stomach acid (for optimum pH) and emulsifies fats (increases surface area)." },
            { id: "b178", topic: "Digestion", question: "What is visking tubing?", answer: "Model for gut. Semipermeable membrane lets small molecules through but not big ones." },
            { id: "b179", topic: "Digestion", question: "What is peristalsis?", answer: "Waves of muscle contraction (longitudinal and circular) that squeeze food along the gut." },
            { id: "b180", topic: "Digestion", question: "What are villi?", answer: "Finger-like projections in small intestine. Large surface area, thin walls, good blood supply for absorption." },
            { id: "b181", topic: "Health", question: "What are functional foods?", answer: "Foods claiming health benefits beyond basic nutrition (e.g. disease prevention)." },
            { id: "b182", topic: "Health", question: "What are probiotics?", answer: "Live 'good' bacteria (e.g. in yogurt) to replace gut bacteria." },
            { id: "b183", topic: "Health", question: "What are prebiotics?", answer: "Indigestible carbs that feed 'good' bacteria to promote their growth." },
            { id: "b184", topic: "Health", question: "What are plant stanol esters?", answer: "Chemicals in plants that can help reduce blood cholesterol." },
        ]
    },
    {
        "subject": "Chemistry",
        "cards": [
            { "id": "c1", "topic": "Atomic Structure", "question": "What is the valence shell?", "answer": "The outermost shell of an atom\n\nThis shell determines the chemical properties and reactivity of the element." },
            { "id": "c2", "topic": "Bonding", "question": "What is a covalent bond?", "answer": "A shared pair of electrons between two nonmetals\n\nElectrons are shared to achieve full outer shells." },
            { "id": "c3", "topic": "Periodic Table", "question": "What is a transition metal?", "answer": "A metal that can form one or more stable ions\n\nFound in the central block of the periodic table." },
            { "id": "c4", "topic": "Bonding", "question": "What are molecules?", "answer": "Two or more atoms bonded together by covalent bonds\n\nCan be the same element (O₂) or different elements (H₂O)." },
            { "id": "c5", "topic": "Atomic Structure", "question": "What are ions?", "answer": "An atom that has a charge due to the loss or gaining of electrons\n\nPositive ions (cations) lose electrons, negative ions (anions) gain electrons." },
            { "id": "c6", "topic": "Bonding", "question": "What does heat energy do to molecules?", "answer": "Breaks the intermolecular forces, not the covalent bond\n\nThe bonds within molecules remain intact." },
            { "id": "c7", "topic": "Bonding", "question": "How are forces between molecules (intermolecular forces)?", "answer": "Weak forces that only require a small amount of energy to dissociate them\n\nMuch weaker than covalent bonds." },
            { "id": "c8", "topic": "Atomic Structure", "question": "What are isotopes?", "answer": "Atoms of the same element that have different numbers of neutrons but the same number of protons\n\nE.g., Carbon-12 and Carbon-14" },
            { "id": "c9", "topic": "Atomic Structure", "question": "What is the equation for average of isotopes?", "answer": "(Mass × percent) + (Mass × percent) divided by 100\n\nWeighted average based on abundance." },
            { "id": "c10", "topic": "Metallic Bonding", "question": "What is the structure of metals?", "answer": "1. Lattice structure\n2. Strong electrostatic attractions between positive ions and delocalized electrons\n3. Lots of energy needed to dissociate forces\n4. Resulting in a high melting point" },
            { "id": "c11", "topic": "Metallic Bonding", "question": "Why do metals conduct electricity?", "answer": "Delocalized electrons are free to move throughout the lattice structure and carry charge\n\nElectrons can flow through the metal." },
            { "id": "c12", "topic": "Metallic Bonding", "question": "Why are metals malleable?", "answer": "Metals have layers of atoms that can slide over each other\n\nAlso ductile (can be drawn into wires)." },
            { "id": "c13", "topic": "Metallic Bonding", "question": "Why do metals have high melting and boiling points?", "answer": "Strong electrostatic attraction between positive ions and delocalized electrons\n\nRequires a lot of energy to dissociate the ions apart." },
            { "id": "c14", "topic": "Ionic Bonding", "question": "What is an ionic bond?", "answer": "An electrostatic attraction between oppositely charged ions (metal and non-metal)\n\nElectrons are transferred from metal to non-metal." },
            { "id": "c15", "topic": "Compounds", "question": "What is a compound?", "answer": "Two or more elements chemically combined\n\nCannot be separated by physical means." },
            { "id": "c16", "topic": "Mixtures", "question": "What is a mixture?", "answer": "A combination of two or more elements that are not chemically combined\n\nCan be separated by physical means." },
            { "id": "c17", "topic": "Ionic Bonding", "question": "What are the uses of ionic bonding?", "answer": "Fertilizers for plants, toothpaste\n\nAlso used in salt and cleaning products." },
            { "id": "c18", "topic": "Ionic Bonding", "question": "Why do ionic compounds have high melting and boiling points?", "answer": "Strong electrostatic attractions between oppositely charged ions\n\nNeeds a lot of energy to dissociate ions apart." },
            { "id": "c19", "topic": "Ionic Bonding", "question": "What are the properties of ionic compounds?", "answer": "• High melting points\n• Conducts electricity when molten/dissolved\n• Giant ionic structure" },
            { "id": "c20", "topic": "Ionic Bonding", "question": "How do ionic compounds conduct electricity as a molten but not as a solid?", "answer": "Solid: Lattice structure with fixed positions - ions can't move\n\nMolten: Ions dissociate and are free to move - carry charge to conduct electricity" },
            { "id": "c21", "topic": "Bonding", "question": "Compare ionic and covalent bonds", "answer": "Ionic:\n• Lattice structure with fixed ions\n• Strong electrostatic attractions\n• Lots of energy needed to dissociate\n• Oppositely charged ions attract\n\nCovalent:\n• Weak intermolecular forces\n• Doesn't require much energy to dissociate\n• Easy to break molecules apart" },
            { "id": "c22", "topic": "Bonding", "question": "How are atoms held together in molecules?", "answer": "Covalent bonds\n\nShared pairs of electrons." },
            { "id": "c23", "topic": "Separation Techniques", "question": "How do you separate sodium chloride?", "answer": "Wanted solid only: Evaporate water\n\nWanted both solid and water: Distillation" },
            { "id": "c24", "topic": "Separation Techniques", "question": "What is distillation?", "answer": "The action of purifying a liquid by a process of heating and cooling\n\nSeparates substances based on different boiling points." },
            { "id": "c25", "topic": "Periodic Table", "question": "What are the differences between metals and non-metals?", "answer": "Metals form positive ions\nNon-metals form negative ions\n\nMetals lose electrons, non-metals gain electrons." },
            { "id": "c26", "topic": "Bonding", "question": "Why is fluorine a gas at room temperature?", "answer": "Weak intermolecular forces - molecules don't need much energy to dissociate\n\nAs a gas, molecules are able to move freely." },
            { "id": "c27", "topic": "Ionic Bonding", "question": "What happens when lithium transfers one electron to bromine?", "answer": "Lithium transfers one electron to gain a full outer shell (becomes Li⁺)\nBromine gains one electron to achieve a full outer shell (becomes Br⁻)\n\nBoth are now ions with opposite charges." },
            { "id": "c28", "topic": "Atomic Structure", "question": "Compare the plum pudding model with the nuclear model of the atom", "answer": "Plum pudding:\n• Ball of positive charge with electrons embedded\n• No shells or organization\n• No nucleus\n\nNuclear model:\n• Shells included\n• Nucleus with protons and neutrons\n• Electrons in shells around nucleus" },
            { "id": "c29", "topic": "Metallic Bonding", "question": "Why are metals good for plumbing?", "answer": "• Malleable\n• Giant lattice structure - hard to break\n• Good conductor of heat\n• Resistant to corrosion" },
            { "id": "c30", "topic": "Bonding", "question": "A particle of ammonia is called a...", "answer": "Molecule\n\nAmmonia (NH₃) consists of atoms bonded by covalent bonds." },
            { "id": "c31", "topic": "Properties", "question": "What does ductile mean?", "answer": "Can be drawn out into wires easily\n\nCommon property of metals." },
            { "id": "c32", "topic": "Properties", "question": "What does brittle mean?", "answer": "Hard but liable to break easily\n\nCommon property of ionic compounds and ceramics." },
            { "id": "c33", "topic": "Metallic Bonding", "question": "What are the properties of metals?", "answer": "• Malleable\n• Lattice structure\n• Lustrous (shiny)\n• Conduct electricity\n• High melting point\n• Strong electrostatic attraction" },
            { "id": "c34", "topic": "Alloys", "question": "What is an alloy?", "answer": "A mixture of at least two elements where at least one is a metal\n\nAlloys have different properties than pure metals." },
            { "id": "c35", "topic": "Alloys", "question": "Give examples of alloys", "answer": "Steel, brass, bronze\n\nEach has enhanced properties compared to pure metals." },
            { "id": "c36", "topic": "Alloys", "question": "What are smart alloys?", "answer": "Alloys that have combined with other elements to get stronger\n\nCan return to original shape after deformation (shape memory alloys)." },
            { "id": "c37", "topic": "Alloys", "question": "What is steel made of?", "answer": "Iron and carbon\n\nCarbon makes iron harder and stronger." },
            { "id": "c38", "topic": "Alloys", "question": "What is bronze made of?", "answer": "Copper and tin\n\nUsed historically for tools and weapons." },
            { "id": "c39", "topic": "Alloys", "question": "What is brass made of?", "answer": "Copper and zinc\n\nUsed in musical instruments and door fittings." },
            { "id": "c40", "topic": "Alloys", "question": "Why is it harder for alloyed layers to slide?", "answer": "There are different sized atoms - layers can't slide easily\n\nThis makes alloys harder than pure metals." },
            { "id": "c41", "topic": "Reactivity", "question": "Is gold reactive or unreactive?", "answer": "Unreactive\n\nThis is why gold doesn't corrode and is valuable." },
            { "id": "c42", "topic": "Corrosion", "question": "What is corrosion?", "answer": "Formation of compounds on the surface of a metal\n\nE.g., rusting of iron (iron oxide formation)." },
            { "id": "c43", "topic": "Corrosion", "question": "How do you protect iron from rusting?", "answer": "• Coat with unreactive metal (galvanizing with zinc)\n• Paint it\n• Oil it\n\nPrevents oxygen and water contact." },
            { "id": "c44", "topic": "Giant Covalent", "question": "What is an allotrope?", "answer": "Structures which contain the same element but arranged differently\n\nDifferent physical properties due to different structures." },
            { "id": "c45", "topic": "Giant Covalent", "question": "Give examples of allotropes", "answer": "Diamond and graphite (both carbon)\n\nAlso: graphene and fullerenes." },
            { "id": "c46", "topic": "Giant Covalent", "question": "What type of bond is diamond?", "answer": "Giant covalent structure\n\nEach carbon forms 4 covalent bonds." },
            { "id": "c47", "topic": "Giant Covalent", "question": "What is the structure of diamond?", "answer": "Giant covalent structure with 4 carbon-carbon covalent bonds per atom\n\n3D tetrahedral lattice structure." },
            { "id": "c48", "topic": "Giant Covalent", "question": "How does diamond have a high melting point?", "answer": "• Strong covalent bonds throughout structure\n• Molecules need a lot of energy to dissociate\n• Strong electrostatic attractions\n• Giant structure" },
            { "id": "c49", "topic": "Giant Covalent", "question": "What is the scientific term for sand?", "answer": "Silicon dioxide (SiO₂)\n\nAlso a giant covalent structure." },
            { "id": "c50", "topic": "Giant Covalent", "question": "What are the properties of diamond?", "answer": "• Strong covalent bonds - lattice structure\n• High melting point - lots of energy needed\n• No delocalized electrons - doesn't conduct electricity\n• Very hard" },
            { "id": "c51", "topic": "Giant Covalent", "question": "What are the properties of graphite?", "answer": "• Soft - layers with weak intermolecular forces\n• High melting point - lots of covalent bonds\n• Delocalized electrons - conducts electricity\n• Layers can slide" },
            { "id": "c52", "topic": "Giant Covalent", "question": "Why is graphite softer than diamond?", "answer": "• Structure in layers\n• Weak intermolecular forces between layers\n• Diamond has strong covalent bonds in 3D structure\n• Has delocalized electrons that can move\n• Diamond has no delocalized electrons - fixed structure" },
            { "id": "c53", "topic": "Giant Covalent", "question": "What is graphene?", "answer": "A single layer of graphite - 2D structure\n\nOne atom thick sheet of carbon." },
            { "id": "c54", "topic": "Giant Covalent", "question": "What is a fullerene?", "answer": "Molecules of carbon atoms with hollow shapes\n\nE.g., Buckminsterfullerene (C₆₀)." },
            { "id": "c55", "topic": "Giant Covalent", "question": "What is the structure of fullerenes?", "answer": "• 3D structure\n• Shaped into hollow balls or tubes\n• Carbon atoms arranged in hexagons and pentagons" },
            { "id": "c56", "topic": "Giant Covalent", "question": "What are the properties of fullerenes?", "answer": "• High tensile strength\n• High electrical conductivity\n• Can trap other molecules inside" },
            { "id": "c57", "topic": "Giant Covalent", "question": "What are the uses of fullerenes?", "answer": "Lubricants\n\nAlso: drug delivery, catalysts, nanotubes." },
            { "id": "c58", "topic": "Giant Covalent", "question": "What is the structure of graphene?", "answer": "• 2D structure\n• Single layer of carbon atoms\n• Hexagonal arrangement" },
            { "id": "c59", "topic": "Giant Covalent", "question": "What are the properties of graphene?", "answer": "• Thin (one atom thick)\n• Conducts electricity\n• Very strong\n• Transparent" },
            { "id": "c60", "topic": "Giant Covalent", "question": "What are the uses of graphene?", "answer": "Solar panels and batteries\n\nAlso: flexible electronics, composite materials." },
            { "id": "c61", "topic": "Bonding", "question": "Why does ethanol have a low boiling point?", "answer": "Weak intermolecular forces\n\nDoesn't require much energy to break these forces." },
            { "id": "c62", "topic": "Ionic Bonding", "question": "Why does magnesium sulfate conduct electricity as a liquid but not as a solid?", "answer": "Liquid: Ions are delocalized and free to move\n\nSolid: Ions are in fixed positions in lattice - cannot move." },
            { "id": "c63", "topic": "Polymers", "question": "What are polymers?", "answer": "Long chains of monomers\n\nFormed by polymerization reactions." },
            { "id": "c64", "topic": "Polymers", "question": "What are monomers?", "answer": "Small molecules that join together to form polymers\n\nE.g., ethene is the monomer for poly(ethene)." },
            { "id": "c65", "topic": "Polymers", "question": "Why are low density polymers flexible?", "answer": "Made at high temperature and pressure\n\nBranched chains with weak intermolecular forces." },
            { "id": "c66", "topic": "Chemical Reactions", "question": "Acid + alkali →", "answer": "Salt + water\n\nNeutralization reaction." },
            { "id": "c67", "topic": "Chemical Reactions", "question": "Metal + acid →", "answer": "Salt + hydrogen\n\nRedox reaction." },
            { "id": "c68", "topic": "Chemical Reactions", "question": "Acid + carbonate →", "answer": "Salt + carbon dioxide + water\n\nTest for carbonates." },
            { "id": "c69", "topic": "Chemical Reactions", "question": "Lithium + hydrochloric acid →", "answer": "Lithium chloride + hydrogen\n\nMetal + acid reaction." },
            { "id": "c70", "topic": "Chemical Reactions", "question": "Hydrochloric acid + calcium carbonate →", "answer": "Calcium chloride + carbon dioxide + water\n\nAcid + carbonate reaction." },
            { "id": "c71", "topic": "Quantitative Chemistry", "question": "What is the Law of Conservation of Mass?", "answer": "Mass cannot be created or destroyed in ordinary chemical and physical changes\n\nTotal mass of reactants = total mass of products." },
            { "id": "c72", "topic": "Quantitative Chemistry", "question": "What is Avogadro's constant?", "answer": "6.02 × 10²³\n\nThe number of particles in one mole." },
            { "id": "c73", "topic": "Quantitative Chemistry", "question": "What is the moles equation?", "answer": "Moles = mass / Mᵣ\n\nWhere Mᵣ is relative formula mass." },
            { "id": "c74", "topic": "Quantitative Chemistry", "question": "What is concentration?", "answer": "The amount of a substance in a certain volume of a solution\n\nMeasured in g/dm³ or mol/dm³." },
            { "id": "c75", "topic": "Quantitative Chemistry", "question": "What is the concentration equation?", "answer": "Concentration = mass / volume\n\nOr moles / volume (in dm³)." },
            { "id": "c76", "topic": "Chemical Reactions", "question": "Metal + water →", "answer": "Metal hydroxide (alkali) + hydrogen\n\nOnly for reactive metals." },
            { "id": "c77", "topic": "Reactivity Series", "question": "Reactions of lithium with water", "answer": "• Vigorous fizzing\n• Slowly dissolves\n• Purple solution (with indicator)\n• Floats on surface" },
            { "id": "c78", "topic": "Reactivity Series", "question": "Reactions of sodium with water", "answer": "• Fizzing\n• Quickly dissolves\n• Purple solution (with indicator)\n• Moves around surface\n• Forms a ball" },
            { "id": "c79", "topic": "Reactivity Series", "question": "Reactions of potassium with water", "answer": "• Violent fizzing\n• Moves around surface\n• Catches fire (lilac flame)\n• Quickly dissolves\n• Purple solution (with indicator)" },
            { "id": "c80", "topic": "Reactivity Series", "question": "Reactions of calcium with water", "answer": "• Gentle fizzing\n• Slowly dissolves\n• Purple solution (with indicator)\n• Sinks then may float" },
            { "id": "c81", "topic": "Reactivity Series", "question": "Reactions of magnesium with water", "answer": "• Few bubbles\n• Slow reaction\n• Very slow at room temperature" },
            { "id": "c82", "topic": "Reactivity Series", "question": "Which metals had no reaction with water?", "answer": "Zinc, iron, copper\n\nThese are below magnesium in the reactivity series." },
            { "id": "c83", "topic": "Reactivity Series", "question": "What is a displacement reaction?", "answer": "When a more reactive metal displaces a less reactive metal from an aqueous solution of one of its salts\n\nE.g., Zn + CuSO₄ → ZnSO₄ + Cu" },
            { "id": "c84", "topic": "Acids and Alkalis", "question": "What are the different types of salt?", "answer": "Chloride, nitrate, sulfate\n\nDepends on the acid used." },
            { "id": "c85", "topic": "Acids and Alkalis", "question": "All alkalis are __ but not all __ are alkalis", "answer": "Bases\n\nAlkalis are soluble bases." },
            { "id": "c86", "topic": "Acids and Alkalis", "question": "What are bases?", "answer": "A substance that neutralizes an acid\n\nMetal oxides and metal hydroxides are bases." },
            { "id": "c87", "topic": "Chemical Reactions", "question": "Metal oxide + acid →", "answer": "Salt + water\n\nNeutralization reaction." },
            { "id": "c88", "topic": "Chemical Reactions", "question": "Metal hydroxide + acid →", "answer": "Salt + water\n\nNeutralization reaction." },
            { "id": "c89", "topic": "Acids and Alkalis", "question": "What is the symbol for nitric acid?", "answer": "HNO₃\n\nProduces nitrate salts." },
            { "id": "c90", "topic": "Acids and Alkalis", "question": "What is the symbol for hydrochloric acid?", "answer": "HCl\n\nProduces chloride salts." },
            { "id": "c91", "topic": "Acids and Alkalis", "question": "What is the symbol for sulfuric acid?", "answer": "H₂SO₄\n\nProduces sulfate salts." },
            { "id": "c92", "topic": "Redox", "question": "What is oxidation?", "answer": "Loss of electrons and gaining of oxygen\n\nOIL: Oxidation Is Loss (of electrons)." },
            { "id": "c93", "topic": "Redox", "question": "What is reduction?", "answer": "Gain of electrons, loss of oxygen\n\nRIG: Reduction Is Gain (of electrons)." },
            { "id": "c94", "topic": "Redox", "question": "What is a redox reaction?", "answer": "When oxidation and reduction happen at the same time\n\nOne species is oxidized while another is reduced." },
            { "id": "c95", "topic": "Chemical Reactions", "question": "Hydrochloric acid + sodium carbonate →", "answer": "Sodium chloride + water + carbon dioxide\n\nAcid + carbonate reaction." },
            { "id": "c96", "topic": "Chemical Reactions", "question": "Sulfuric acid + calcium carbonate →", "answer": "Calcium sulfate + water + carbon dioxide\n\nAcid + carbonate reaction." },
            { "id": "c97", "topic": "Electrolysis", "question": "What is electrolysis?", "answer": "The breaking down of an ionic compound using electricity\n\nRequires molten or aqueous ionic compound." },
            { "id": "c98", "topic": "Electrolysis", "question": "Metals form...", "answer": "Positive ions (cations)\n\nThey lose electrons." },
            { "id": "c99", "topic": "Electrolysis", "question": "Non-metals form...", "answer": "Negative ions (anions)\n\nThey gain electrons." },
            { "id": "c100", "topic": "Electrolysis", "question": "What are the conditions needed for electrolysis?", "answer": "An ionic compound that is either molten or aqueous so ions are free to move and carry charge\n\nThis liquid is known as the electrolyte." },
            { "id": "c101", "topic": "Electrolysis", "question": "What is the anode?", "answer": "Positive electrode\n\nNegative ions are attracted here and oxidized." },
            { "id": "c102", "topic": "Electrolysis", "question": "What is the cathode?", "answer": "Negative electrode\n\nPositive ions are attracted here and reduced." },
            { "id": "c103", "topic": "Electrolysis", "question": "What happens at the cathode?", "answer": "Positively charged ions are attracted to the negative electrode\n\nThey gain electrons and are reduced to produce elements." },
            { "id": "c104", "topic": "Electrolysis", "question": "What happens at the anode?", "answer": "Negatively charged ions are attracted to the positive electrode\n\nThey lose electrons and are oxidized." },
            { "id": "c105", "topic": "Electrolysis", "question": "What does molten mean?", "answer": "Melted form of a metal or ionic compound\n\nIons are free to move." },
            { "id": "c106", "topic": "Electrolysis", "question": "Describe the electrolysis of zinc chloride", "answer": "When melted, ions become delocalized and free to move\n\nZn²⁺ travels to cathode (reduced to Zn)\nCl⁻ travels to anode (oxidized to Cl₂)" },
            { "id": "c107", "topic": "Electrolysis", "question": "What does aqueous mean?", "answer": "A solid ionic compound dissolved in water\n\nIons are free to move in solution." },
            { "id": "c108", "topic": "Electrolysis", "question": "Describe the electrolysis of NaCl dissolved in H₂O", "answer": "When dissolved, we obtain Na⁺ and Cl⁻\n\nAt cathode: Hydrogen is produced (H₂O reduced)\nAt anode: Chlorine is produced (Cl⁻ oxidized)" },
            { "id": "c109", "topic": "Electrolysis", "question": "Why must ionic compounds be molten or dissolved?", "answer": "So ions can move to complete the circuit and carry the charge\n\nSolid ionic compounds have fixed ions." },
            { "id": "c110", "topic": "Electrolysis", "question": "What is an electrolyte?", "answer": "Ionic compounds that are in a molten state or dissolved in water\n\nCan conduct electricity because ions are free to move." },
            { "id": "c111", "topic": "Energy Changes", "question": "What is an exothermic reaction?", "answer": "A reaction that releases energy in the form of heat\n\nTemperature of surroundings increases.\nE.g., combustion, neutralization." },
            { "id": "c112", "topic": "Energy Changes", "question": "What is an endothermic reaction?", "answer": "A reaction that absorbs energy in the form of heat\n\nTemperature of surroundings decreases.\nE.g., thermal decomposition, photosynthesis." },
            { "id": "c113", "topic": "Energy Changes", "question": "What is the Law of Conservation of Energy?", "answer": "Energy cannot be created or destroyed in a chemical reaction\n\nIt can only be transferred between forms." },
            { "id": "c114", "topic": "Energy Changes", "question": "Describe an endothermic energy profile diagram", "answer": "Products have more energy than reactants\n\nEnergy is absorbed from surroundings.\nCurve goes up from reactants to products." },
            { "id": "c115", "topic": "Energy Changes", "question": "Describe an exothermic energy profile diagram", "answer": "Products have less energy than reactants\n\nEnergy is released to surroundings.\nCurve goes down from reactants to products." },
            { "id": "c116", "topic": "Energy Changes", "question": "What is activation energy?", "answer": "The minimum amount of energy required for a reaction to take place\n\nThe energy barrier that must be overcome." },
            { "id": "c117", "topic": "Energy Changes", "question": "Is bond breaking endothermic or exothermic?", "answer": "Endothermic - energy is required\n\nEnergy must be supplied to break bonds." },
            { "id": "c118", "topic": "Energy Changes", "question": "Is bond making endothermic or exothermic?", "answer": "Exothermic - releases energy\n\nEnergy is released when new bonds form." },
            { "id": "c119", "topic": "Energy Changes", "question": "How do you calculate bond energy changes?", "answer": "Energy change = Bonds broken - Bonds formed\n\nPositive = endothermic, Negative = exothermic." },
            { "id": "c120", "topic": "Energy Changes", "question": "What can fuel cells be used for?", "answer": "Power cars - cells fed with hydrogen and oxygen producing water\n\n• Don't need electricity\n• No pollutants\n• Hydrogen is highly flammable - difficult to store" },
            { "id": "c121", "topic": "Rate of Reaction", "question": "How do you measure rate of reaction?", "answer": "Measure how quickly reactants are used up OR how quickly products are made\n\nCan measure mass loss or volume of gas produced." },
            { "id": "c122", "topic": "Rate of Reaction", "question": "What is collision theory?", "answer": "Particles need to collide with enough energy (activation energy) to cause a reaction to take place\n\nMore frequent successful collisions = faster reaction." },
            { "id": "c123", "topic": "Rate of Reaction", "question": "What factors affect rate of reaction?", "answer": "• Temperature\n• Surface area\n• Catalyst\n• Concentration (or pressure for gases)" },
            { "id": "c124", "topic": "Rate of Reaction", "question": "What is the effect of catalysts?", "answer": "Lowers activation energy and makes reactions go faster\n\nNot used up in the reaction." },
            { "id": "c125", "topic": "Rate of Reaction", "question": "What is the equation for rate of reaction?", "answer": "Rate = Quantity of products formed / Time taken\n\nOR\n\nRate = Quantity of reactants used / Time taken\n\nUnits: g/s or cm³/s" },
            { "id": "c126", "topic": "Rate of Reaction", "question": "Describe a rate of reaction graph", "answer": "Mass/volume vs time\n\nSteep gradient = fast reaction\nLine flattens when reaction complete\nFor reactants: decreases (not increases)" },
            { "id": "c127", "topic": "Rate of Reaction", "question": "How does temperature increase affect rate of reaction?", "answer": "Particles gain more energy, move faster, collide more frequently\n\nHigher rate of successful collisions with activation energy." },
            { "id": "c128", "topic": "Rate of Reaction", "question": "How do concentration and pressure affect rate of reaction?", "answer": "Higher concentration/pressure = more particles per unit volume\n\nCollisions more frequent, increases rate of reaction." },
            { "id": "c129", "topic": "Rate of Reaction", "question": "How does surface area affect rate of reaction?", "answer": "Higher surface area = increased rate of reaction\n\nMore particles exposed to react." },
            { "id": "c130", "topic": "Rate of Reaction", "question": "How do you measure rate at a particular time on a graph?", "answer": "1. Find where time intersects curve\n2. Draw tangent (must touch y-axis)\n3. Calculate gradient = change in y / change in x" },
            { "id": "c131", "topic": "Gas Tests", "question": "How do you test for chlorine?", "answer": "1. Test tube with sample gas\n2. Dampen blue litmus paper\n3. Place in test tube\n4. If turns red then white → chlorine present (acidic)\n\nWear mask - chlorine is toxic." },
            { "id": "c132", "topic": "Gas Tests", "question": "How do you test for oxygen?", "answer": "Place glowing splint into tube of gas\n\nIf glowing splint relights → oxygen present." },
            { "id": "c133", "topic": "Gas Tests", "question": "How do you test for hydrogen?", "answer": "Test tube with hydrogen, burning splint brought close\n\nIf produces 'pop' sound → hydrogen present\n(Hydrogen burns with oxygen to form water)" },
            { "id": "c134", "topic": "Gas Tests", "question": "How do you test for carbon dioxide?", "answer": "Bubble gas through calcium hydroxide (limewater)\n\nIf solution goes cloudy → CO₂ present\n(Forms calcium carbonate precipitate)" },
            { "id": "c135", "topic": "Equilibrium", "question": "What is a reversible reaction?", "answer": "A chemical reaction in which products can react to reform reactants\n\nIndicated by ⇌ symbol." },
            { "id": "c136", "topic": "Equilibrium", "question": "What is equilibrium position?", "answer": "Rate of forward reaction = Rate of backward reaction\n\nConcentration of products and reactants do not change." },
            { "id": "c137", "topic": "Equilibrium", "question": "What is a closed system?", "answer": "Equilibrium only works when chemicals cannot escape\n\nNothing can get in or out of the reaction vessel." },
            { "id": "c138", "topic": "Equilibrium", "question": "What is Le Chatelier's Principle?", "answer": "When a change is made to a condition of a reaction, the system responds to counteract the change\n\nEquilibrium shifts to oppose the change." },
            { "id": "c139", "topic": "Equilibrium", "question": "Which conditions change the position of equilibrium?", "answer": "• Concentration\n• Temperature\n• Pressure (for gases)" },
            { "id": "c140", "topic": "Equilibrium", "question": "What happens if the concentration of reactant is increased?", "answer": "More products will be formed until equilibrium is reached again\n\nEquilibrium shifts to the right (forward reaction)." },
            { "id": "c141", "topic": "Equilibrium", "question": "What happens if the concentration of product is decreased?", "answer": "More reactants will react until equilibrium is reached again\n\nEquilibrium shifts to the right to replace products." },
            { "id": "c142", "topic": "Equilibrium", "question": "What is yield?", "answer": "The amount of product produced in a reaction\n\nCan be actual yield or percentage yield." },
            { "id": "c143", "topic": "Equilibrium", "question": "What happens when temperature is increased?", "answer": "Equilibrium shifts to decrease the temperature\n\nShifts in the endothermic direction." },
            { "id": "c144", "topic": "Equilibrium", "question": "What happens when temperature is decreased?", "answer": "Equilibrium shifts to increase the temperature\n\nShifts in the exothermic direction." },
            { "id": "c145", "topic": "Equilibrium", "question": "What happens when pressure is increased?", "answer": "Equilibrium favors the side with fewer moles of gas\n\nShifts to reduce pressure." },
            { "id": "c146", "topic": "Equilibrium", "question": "What happens when pressure is decreased?", "answer": "Equilibrium favors the side with more moles of gas\n\nShifts to increase pressure." }
        ]
    },
    {
        subject: "Physics",
        cards: [
            // Source: https://knowt.com/flashcards/1b026562-d015-4596-ad0c-2b3fd1eeb135
            // Unit 1: Energy
            // Unit 1: Energy
            { id: "p1", topic: "Energy", question: "What is a system?", answer: "A system is an object or a group of objects that interact" },
            { id: "p2", topic: "Energy", question: "What are the different types of energy stores?", answer: "Kinetic, chemical, thermal, gravitational potential, magnetic, electrostatic, elastic potential, nuclear" },
            { id: "p3", topic: "Energy", question: "What does the principle of conservation of energy state?", answer: "That the amount of energy always remains the same, energy cannot be destroyed or created, it only moves from one system to another" },
            { id: "p4", topic: "Energy", question: "How can energy be transferred?", answer: "Light, sound and electricity" },
            { id: "p5", topic: "Energy", question: "Formula of kinetic energy", answer: "KE = 1/2 mv²" },
            { id: "p6", topic: "Energy", question: "Formula of elastic potential energy", answer: "Elastic potential energy (J) = 1/2 × Spring constant (N/m) × Extension² (m)\n(spring constant is stiffness)" },
            { id: "p7", topic: "Energy", question: "Formula of gravitational potential energy", answer: "GPE = mgh" },
            { id: "p8", topic: "Energy", question: "What is work?", answer: "The amount of force needed to move an object a certain distance" },
            { id: "p9", topic: "Energy", question: "Formula of work done", answer: "Work done (J) = force (N) × distance (m)" },
            { id: "p10", topic: "Energy", question: "What is power?", answer: "The rate at which energy is transferred or work is done" },
            { id: "p11", topic: "Energy", question: "What is formula power?", answer: "Power = energy transferred or work done / time" },
            { id: "p12", topic: "Energy", question: "What is specific heat capacity?", answer: "The amount of energy required to heat the temperature of one kilogram of a substance by one degree celsius" },
            { id: "p13", topic: "Energy", question: "What is the formula of specific heat capacity?", answer: "Change in energy = mass × specific heat capacity × temp change" },
            { id: "p14", topic: "Energy", question: "What does dissipate mean?", answer: "To dissipate means to scatter in all directions" },
            { id: "p15", topic: "Energy", question: "What does it mean when energy dissipates?", answer: "It means we cannot get it back, the energy has spread out and heat up the surroundings" },
            { id: "p16", topic: "Energy", question: "How can we reduce the energy dissipation?", answer: "Design generators that don't dissipate energy, design cars that are fuel efficient, streamlined, and lubricated parts" },
            { id: "p17", topic: "Energy", question: "How reduce energy dissipation in home?", answer: "Chimneys allows thermal energy to transfer upstairs\nWall small so less area to heat, more thermal conductive, more thicker, and difference between inside and outside\nLoft insulation and carpets, double glazing means leave a gap in between window" },
            { id: "p18", topic: "Energy", question: "What is efficiency?", answer: "A way of expressing the proportion of energy that is usefully transferred in a process" },
            { id: "p19", topic: "Energy", question: "Formula of efficiency", answer: "Useful output (energy) or (power output) / total (power output)(energy transfer)" },
            { id: "p20", topic: "Energy", question: "What is formula of work done?", answer: "Work done = force × distance" },
            { id: "p21", topic: "Energy", question: "How to reduce friction?", answer: "Using wheel or lubricants" },
            { id: "p22", topic: "Energy", question: "How reduce air resistance?", answer: "Slow travel, streamlining" },
            { id: "p23", topic: "Energy", question: "How does a machine increase efficiency?", answer: "A machine can be a rope, this acts as a force multiplier allowing to lift heavier weight with less force, this means that the men have to use small force and save energy and time" },
            { id: "p24", topic: "Energy", question: "What are non renewable energy sources?", answer: "Energy sources that will run out as there is not a finite reserve that can replenish (gas, oil, fossil fuel)" },
            { id: "p25", topic: "Energy", question: "What are renewable energy?", answer: "Will never run out or replenish as used (sun, wind)" },
            { id: "p26", topic: "Energy", question: "What are the three main use of fossil fuel?", answer: "Transport, heating, electricity" },

            // Unit 2: Electricity
            { id: "p27", topic: "Electricity", question: "What is potential difference?", answer: "Is a measure of electrical work done by a cell as charge flows round the circuit. It is measured in volts" },
            { id: "p28", topic: "Electricity", question: "What is electric current?", answer: "The flow of electrical charge. The size of current is rate which charge flows round circuit! Measured in amperes or amps" },
            { id: "p29", topic: "Electricity", question: "How does current flow?", answer: "From the positive terminal to the negative terminal" },
            { id: "p30", topic: "Electricity", question: "How is charge measured?", answer: "Measured in coulombs (1 coulomb = 6 billion electrons)" },
            { id: "p31", topic: "Electricity", question: "How to increase or decrease current?", answer: "Change potential difference or change components (add resistor)" },
            { id: "p32", topic: "Electricity", question: "What is an ammeter?", answer: "Set in series with resistor, it measures the current of the circuit" },
            { id: "p33", topic: "Electricity", question: "What is a voltmeter?", answer: "Placed parallel and only small current flow, measures voltage" },
            { id: "p34", topic: "Electricity", question: "What is resistance?", answer: "Opposition to the flow of current" },
            { id: "p35", topic: "Electricity", question: "What does the resistance depend on?", answer: "Resistance of component and the potential difference across the component" },
            { id: "p36", topic: "Electricity", question: "What is an ohmic conductor?", answer: "A conductor that obeys Ohm's law" },
            { id: "p37", topic: "Electricity", question: "What is Ohm's law?", answer: "V = IR" },
            { id: "p38", topic: "Electricity", question: "Ohmic conductor current", answer: "The current flowing through ohmic conductor is proportional to the potential difference" },
            { id: "p39", topic: "Electricity", question: "What is a non ohmic conductor?", answer: "Electrical component where current and voltage are not directly proportional" },
            { id: "p40", topic: "Electricity", question: "What is a diode?", answer: "A component that allows current to go in one direction. Current flows when reaches 0.7 V. It has a very high resistance in the reverse direction so current can't flow" },
            { id: "p41", topic: "Electricity", question: "What is a thermistor?", answer: "Component in which resistance decreases as temp increases" },
            { id: "p42", topic: "Electricity", question: "What is a light dependent resistor?", answer: "A resistor in which resistance increases when light intensity decreases" },
            { id: "p43", topic: "Electricity", question: "Series circuit", answer: "A circuit in which all parts are connected end to end to provide a single path of current" },
            { id: "p44", topic: "Electricity", question: "Series circuit rules", answer: "Same current through each component, the total potential difference is shared equally, the resistance is the sum of the resistance of each component" },
            { id: "p45", topic: "Electricity", question: "Parallel circuit", answer: "A circuit that contains more than one path for current flow" },
            { id: "p46", topic: "Electricity", question: "Parallel circuit rules", answer: "The potential difference across each component is the same\nThe total current is sum of each current through the separate components\nThe total resistance of two resistors in parallel is less than the resistance of smaller individual ones" },
            { id: "p47", topic: "Electricity", question: "What is direct current?", answer: "Current that flows in only one direction" },
            { id: "p48", topic: "Electricity", question: "What is alternating current?", answer: "A flow of electric charge that regularly reverses its direction" },
            { id: "p49", topic: "Electricity", question: "What is the voltage of DC supply?", answer: "6 V" },
            { id: "p50", topic: "Electricity", question: "What is the UK's main supply?", answer: "Alternating current, 230 volts and 50 Hz" },
            { id: "p51", topic: "Electricity", question: "What are cables?", answer: "13 A current carrying wires, bunch of wires" },
            { id: "p52", topic: "Electricity", question: "Type of wires", answer: "Live, neutral and earth" },
            { id: "p53", topic: "Electricity", question: "What is live wire?", answer: "Brown wire, in a live wire an alternating potential difference is carried from the main supply" },
            { id: "p54", topic: "Electricity", question: "What is neutral wire?", answer: "Blue, it completes the circuit, no voltage" },
            { id: "p55", topic: "Electricity", question: "What is the earth wire?", answer: "Green and yellow striped cable, it stops the appliance from going live, and carries current if there is a fault" },
            { id: "p56", topic: "Electricity", question: "What is the national grid?", answer: "A giant system of cables and transformers that covers the UK and connects power stations to consumers" },
            { id: "p57", topic: "Electricity", question: "How does the national grid prevent dissipation of a lot of energy?", answer: "Low current so less energy is wasted heating up the cable" },
            { id: "p58", topic: "Electricity", question: "Steps in the national grid", answer: "Generator sends 1000 A potential diff and 2500 V to the grid\nTransformer steps the potential diff to 400,000 V and current to 62.5\nWhen it goes home it decreases potential diff to 230 and current to a safe amount" },
            { id: "p59", topic: "Electricity", question: "What is electricity?", answer: "The flow of electrons" },
            { id: "p60", topic: "Electricity", question: "What is static electricity?", answer: "When electrical charge is stationary on the surface of an object" },
            { id: "p61", topic: "Electricity", question: "How can static electricity be made?", answer: "By rubbing some insulating materials together, negatively charged electrons are rubbed off one material and to the other one, the material that loses electrons is positively charged" },
            { id: "p62", topic: "Electricity", question: "What is an electric field?", answer: "The region around a charged object in which an electric force is exerted on another charged object" },
            { id: "p63", topic: "Electricity", question: "How to draw an electric field?", answer: "It is always drawn as effect on positive charge, so a positive field repels the thing, and negative attracts" },
            { id: "p64", topic: "Electricity", question: "Formulas for unit 2", answer: "Q = I T (charge flow = current × time)\nV = IR (potential diff = current × resistance)\nE = V Q (energy transferred = potential diff × charge)\nE = P t (energy transferred = power × time)\nP = V I (power = potential diff × current)\nP = I² R (power = current squared × resistance)" },

            // Unit 3: Particle Model of Matter
            { id: "p65", topic: "Particle Model", question: "What is density?", answer: "How tightly packed the particles are together or mass per volume" },
            { id: "p66", topic: "Particle Model", question: "Density formula", answer: "ρ = M / V (density = mass / volume)" },
            { id: "p67", topic: "Particle Model", question: "What is the structure of a solid?", answer: "Atoms/molecules are packed in a regular structure, fixed position and held close" },
            { id: "p68", topic: "Particle Model", question: "What is the structure of a liquid?", answer: "The atoms or molecules in a liquid are close together, but they can move from one place to another" },
            { id: "p69", topic: "Particle Model", question: "What is the structure of a gas?", answer: "In a gas the atoms or molecules are separated by large distances" },
            { id: "p70", topic: "Particle Model", question: "Densities of solid liquid gas", answer: "Solid most dense, then liquid, then gas" },
            { id: "p71", topic: "Particle Model", question: "What is internal energy?", answer: "The energy stored by the particles that make up a system (the total kinetic and potential energy of all the particles that make up a system)" },
            { id: "p72", topic: "Particle Model", question: "How does heating change energy in a system?", answer: "Heating increases temp of system, so particles have more kinetic energy and move faster, heating can also change the state" },
            { id: "p73", topic: "Particle Model", question: "What is specific heat capacity?", answer: "The amount of energy required to increase the temperature of 1kg of a substance by 1°C" },
            { id: "p74", topic: "Particle Model", question: "What affects temperature of a system?", answer: "The mass that be heated up, what the substance is made of, the energy put into the system" },
            { id: "p75", topic: "Particle Model", question: "What is latent heat?", answer: "The amount of energy needed for 1kg of a substance to change state" },
            { id: "p76", topic: "Particle Model", question: "Formula of specific latent heat", answer: "E = m L (energy required = mass × specific latent heat)" },
            { id: "p77", topic: "Particle Model", question: "What is the specific latent heat of fusion?", answer: "The specific latent heat for changing between a solid & a liquid" },
            { id: "p78", topic: "Particle Model", question: "Energy change in melting", answer: "Energy is supplied" },
            { id: "p79", topic: "Particle Model", question: "Energy change in vaporising or condensing", answer: "To vaporise energy is supplied, when condense energy is transferred out" },
            { id: "p80", topic: "Particle Model", question: "How to measure latent heat?", answer: "Heat beaker of water, when boiling reset joulemeter, then boil for 5 minutes, then measure joulmeter reading - power" },
            { id: "p81", topic: "Particle Model", question: "What is the particle model?", answer: "The particle model describes how particles are arranged and how they move in solids, liquids and gases. It also helps to understand the properties of gases" },
            { id: "p82", topic: "Particle Model", question: "Main points of particle model", answer: "The particles in gas are in constant random movement\nThe particles in gas collide with each other and walls of container (WITHOUT LOSING ENERGY)\nTemp of gas relates to kinetic energy of particles\nKinetic energy increases, temp also increases" },
            { id: "p83", topic: "Particle Model", question: "Why does a lid fly off when on a heating up tripod?", answer: "Molecules hit the lid and they increase in speed from the heat" },
            { id: "p84", topic: "Particle Model", question: "Relationship between pressure and volume", answer: "P = 1/V as you decrease volume more collisions of particles so pressure increases. HALVING VOLUME DOUBLES PRESSURE" },

            // Unit 4: Atomic Structure
            { id: "p85", topic: "Atomic Structure", question: "Discovery of electron", answer: "1897 JJ Thompson\nFound that electrons emitted from surface of hot metal\nThey are negatively charged" },
            { id: "p86", topic: "Atomic Structure", question: "Plum pudding model", answer: "J.J. Thomson's model of an atom, in which he thought electrons were randomly distributed within a positively charged cloud" },
            { id: "p87", topic: "Atomic Structure", question: "The nuclear model", answer: "1911, Ernest Rutherford\nBased on the gold foil experiment" },
            { id: "p88", topic: "Atomic Structure", question: "Bohr model", answer: "A 1913, he suggested that electrons move round the nucleus in circular orbits at specific energy shells/levels" },
            { id: "p89", topic: "Atomic Structure", question: "How did Henry Becquerel discover radioactivity?", answer: "Found in 1896, he placed some uranium salts next to a photographic plate in a thick black bag. When he checked the plate it was as if it was exposed to light and he then realized it was from the salts that passed through the bag" },
            { id: "p90", topic: "Atomic Structure", question: "What is nuclear decay?", answer: "A process that occurs when an unstable atomic nucleus changes into another more stable nucleus by emitting radiation" },
            { id: "p91", topic: "Atomic Structure", question: "What is radioactivity?", answer: "A process in which an unstable nuclei throw out particles to make the nucleus more stable, it is a random process" },
            { id: "p92", topic: "Atomic Structure", question: "What are the four types of radioactive emission?", answer: "Alpha particle, Beta particle, Gamma ray, Neutrons" },
            { id: "p93", topic: "Atomic Structure", question: "What is an alpha particle?", answer: "An alpha particle is the same as helium nuclei (2 protons and 2 neutrons)\nWhen emitted from a nucleus it causes nucleus to change into another nucleus with mass number that is four less and atomic number two less than the original\nThis is alpha decay" },
            { id: "p94", topic: "Atomic Structure", question: "What is beta particle?", answer: "Fast moving electron emitted by the nucleus\nIt is formed when a neutron turns to a proton and an electron\nDoes not change the mass, but it INCREASES ATOMIC NUMBER BY 1" },
            { id: "p95", topic: "Atomic Structure", question: "What is a gamma ray?", answer: "Electromagnetic waves that carry a lot of energy, so nucleus is more stable although no change to mass or atomic number of an atom" },
            { id: "p96", topic: "Atomic Structure", question: "What are neutron emissions?", answer: "Sometimes neutrons are emitted from highly unstable nuclei, this reduces mass number by 1" },
            { id: "p97", topic: "Atomic Structure", question: "What type of radiation are ionising?", answer: "All types" },
            { id: "p98", topic: "Atomic Structure", question: "What is ionisation?", answer: "When an atom gains or loses an electron\nCaused when an alpha particle pulls an electron out of an atom" },
            { id: "p99", topic: "Atomic Structure", question: "What is a Geiger Muller tube?", answer: "A device that detects ionising radiation. An electronic counter can record number of particles entering" },
            { id: "p100", topic: "Atomic Structure", question: "What is background count?", answer: "Is the average count rate in which a Geiger Muller tube records over a period of time, the background count is caused by other radioactive materials in the environment" },
            { id: "p101", topic: "Atomic Structure", question: "What are properties of alpha particles?", answer: "Travel about 5cm through air but can be stopped by sheet of paper\nVery ionising though" },
            { id: "p102", topic: "Atomic Structure", question: "What are properties of beta particles?", answer: "Can travel several metres through air\nStopped by a sheet of aluminium that is a few millimetres thick\nDo not ionise as strongly as alpha" },
            { id: "p103", topic: "Atomic Structure", question: "What are the properties of gamma rays?", answer: "Travel a long long distance\nCan only be stopped by a very thick piece of lead\nWeak ionising" },
            { id: "p104", topic: "Atomic Structure", question: "Why is radiation dangerous?", answer: "It can cause damage to cells and tissue" },
            { id: "p105", topic: "Atomic Structure", question: "What is background radiation?", answer: "Radiation caused from natural and man made sources in our environment" },
            { id: "p106", topic: "Atomic Structure", question: "What is a half life?", answer: "The time it takes for the number of nuclei in a radioactive isotope to halve\nWhen calculating half life, do half life - background count" },
            { id: "p107", topic: "Atomic Structure", question: "What is a becquerel?", answer: "An emission of 1 particle per second" },
            { id: "p108", topic: "Atomic Structure", question: "What is carbon dating?", answer: "The process of using the radioactive isotopes in carbon-14 to determine age of ancient objects" },
            { id: "p109", topic: "Atomic Structure", question: "What is radiation damage?", answer: "Can destroy body tissue and can change genes" },
            { id: "p110", topic: "Atomic Structure", question: "What is nuclear fission?", answer: "The splitting of an atomic nucleus due to neutron hitting the nucleus, it splits into two smaller nuclei. From the nuclei that were split, two or three more neutrons are released. RELEASES A TREMENDOUS AMOUNT OF ENERGY" },
            { id: "p111", topic: "Atomic Structure", question: "What is a chain reaction caused by nuclear fission?", answer: "When fission happens over and over, can be controlled and used in power stations" },
            { id: "p112", topic: "Atomic Structure", question: "What is nuclear fusion?", answer: "When two small nuclei join together to form a large nucleus and release a large amount of energy, very hard to happen and happens in stars" },

            // Unit 5: Forces
            { id: "p113", topic: "Forces", question: "What is a scalar quantity?", answer: "One that has size or magnitude" },
            { id: "p114", topic: "Forces", question: "What is a vector quantity?", answer: "One that has a size and direction (magnitude)" },
            { id: "p115", topic: "Forces", question: "Examples of scalar quantity", answer: "Mass and temperature (they don't have direction, only size)" },
            { id: "p116", topic: "Forces", question: "Examples of vector quantities", answer: "Velocity" },
            { id: "p117", topic: "Forces", question: "What is velocity?", answer: "Speed in a defined direction" },
            { id: "p118", topic: "Forces", question: "What is displacement?", answer: "Distance travelled in a defined direction" },
            { id: "p119", topic: "Forces", question: "What is force?", answer: "A push or pull" },
            { id: "p120", topic: "Forces", question: "What are contact forces?", answer: "Forces can be exerted between two objects when they touch" },
            { id: "p121", topic: "Forces", question: "What are non contact forces?", answer: "Forces that can be exerted between two objects that are physically separated" },
            { id: "p122", topic: "Forces", question: "Examples of contact forces", answer: "Friction, air resistance, tension and normal contact force" },
            { id: "p123", topic: "Forces", question: "What are examples of non contact forces?", answer: "Gravity, electrostatic forces, magnetic force" },
            { id: "p124", topic: "Forces", question: "What is weight?", answer: "The force of gravity on an object" },
            { id: "p125", topic: "Forces", question: "What is the formula for weight?", answer: "W = mg" },
            { id: "p126", topic: "Forces", question: "Relationship between weight and mass", answer: "Directly proportional" },
            { id: "p127", topic: "Forces", question: "What is mass?", answer: "The amount of matter in an object" },
            { id: "p128", topic: "Forces", question: "What happens to weight in different gravitational fields (planets)?", answer: "Weight changes but mass stays the same" },
            { id: "p129", topic: "Forces", question: "What is the centre of mass?", answer: "The point through which the weight of an object can be taken to act" },
            { id: "p130", topic: "Forces", question: "When is work not being done?", answer: "Even if a force is applied but the thing ain't moving, no work" },
            { id: "p131", topic: "Forces", question: "What can two balanced forces do?", answer: "Stretch a spring and compress a beam" },
            { id: "p132", topic: "Forces", question: "What can three balanced forces do?", answer: "Bend a beam" },
            { id: "p133", topic: "Forces", question: "What is elastic deformation?", answer: "Occurs when an object returns to its original length after it has been stretched" },
            { id: "p134", topic: "Forces", question: "What is inelastic deformation?", answer: "Occurs when an object does not return to its original length after it has been stretched" },
            { id: "p135", topic: "Forces", question: "Extension", answer: "The difference between stretched and unstretched lengths of a spring" },
            { id: "p136", topic: "Forces", question: "Formula for force, spring constant, extension", answer: "Force = spring constant × extension" },
            { id: "p137", topic: "Forces", question: "When is a spring deformed?", answer: "A spring is permanently deformed when it is extended beyond the limit of proportionality" },
            { id: "p138", topic: "Forces", question: "What is a moment?", answer: "The turning effect of a force about a pivot" },
            { id: "p139", topic: "Forces", question: "Formula of moment", answer: "M = F × d" },
            { id: "p140", topic: "Forces", question: "How does a mechanical lever work?", answer: "The more distance there is the less force you have to apply" },
            { id: "p141", topic: "Forces", question: "When is something balanced?", answer: "When the moment on both forces is equal" },
            { id: "p142", topic: "Forces", question: "What is the principle of moments?", answer: "States that when a system is balanced the sum of anticlockwise turning moments equals sum of the clockwise turning moments" },
            { id: "p143", topic: "Forces", question: "What are gears?", answer: "Circular discs with 'teeth' around their edges" },
            { id: "p144", topic: "Forces", question: "What is the purpose of gears?", answer: "Increase or decrease the rotational effects of a force" },
            { id: "p145", topic: "Forces", question: "Input and output gears", answer: "Input shaft turning effect formula = F × r\nOutput shaft turning effect formula = F × 2r" },
            { id: "p146", topic: "Forces", question: "What is a fluid?", answer: "A liquid or a gas, a fluid flows and can change shape" },
            { id: "p147", topic: "Forces", question: "What is the formula of pressure?", answer: "Pressure = Force / Area" },
            { id: "p148", topic: "Forces", question: "Pressure in a column formula", answer: "P = Height × density × gravity" },
            { id: "p149", topic: "Forces", question: "When does an object float in water?", answer: "When the pressure on the bottom of the cylinder is larger than pressure on top causing upthrust\nAN OBJECT FLOATS IF THE UPTHRUST FROM A FLUID IS EQUAL TO THE WEIGHT OF OBJECT" },
            { id: "p150", topic: "Forces", question: "How do molecules in atmosphere exert a pressure on the surface?", answer: "The billions of particles hit the surface each second causing force on the object which is pressure" },
            { id: "p151", topic: "Forces", question: "Average speed formula", answer: "Distance travelled / time (m/s)" },
            { id: "p152", topic: "Forces", question: "What is acceleration?", answer: "The rate at which velocity changes" },
            { id: "p153", topic: "Forces", question: "Formula of acceleration", answer: "Change in velocity / time taken" },
            { id: "p154", topic: "Forces", question: "How to find distance in velocity time graphs?", answer: "The area under the graph is the distance" },
            { id: "p155", topic: "Forces", question: "What does Newton's first law state?", answer: "When the resultant force acting on an object is zero the forces are balanced and the object does not accelerate, it remains stationary, or continues to move in a straight line at a constant speed" },
            { id: "p156", topic: "Forces", question: "What does Newton's second law state?", answer: "When an unbalanced force acts on an object it accelerates" },
            { id: "p157", topic: "Forces", question: "What is the equation for the second law?", answer: "Force = mass × acceleration" },
            { id: "p158", topic: "Forces", question: "What does inertia mean?", answer: "Inertia means inactivity. It is used to describe objects remaining in their existing state of motion at rest or moving with constant speed in a straight line unless affected by a counter force" },
            { id: "p159", topic: "Forces", question: "What is inertial mass?", answer: "Inertial mass is a measure of how difficult it is to change its velocity" },
            { id: "p160", topic: "Forces", question: "What is the formula of inertial mass?", answer: "m = F / Acceleration" },
            { id: "p161", topic: "Forces", question: "What does Newton's third law state?", answer: "Every force has a paired and equal opposite force" },
            { id: "p162", topic: "Forces", question: "What is thinking distance in terms of braking a car?", answer: "The distance a car travels while the driver reacts" },
            { id: "p163", topic: "Forces", question: "What is braking distance in terms of braking a car?", answer: "The distance a car travels while the car is stopped by the brakes" },
            { id: "p164", topic: "Forces", question: "What is the stopping distance?", answer: "Sum of thinking distance and braking distance" },
            { id: "p165", topic: "Forces", question: "Factors that affect thinking distance (reaction time)", answer: "Alcohol, tired, drugs" },
            { id: "p166", topic: "Forces", question: "Factors that affect braking distance", answer: "Size of the force, weather, road surface, car maintenance" },
            { id: "p167", topic: "Forces", question: "What is momentum?", answer: "Product of mass and velocity" },
            { id: "p168", topic: "Forces", question: "What is the formula of momentum?", answer: "Momentum (kg m/s) = mass × velocity" },
            { id: "p169", topic: "Forces", question: "What equation is force, momentum and time?", answer: "Force = change in momentum / time\n(F = ma, A = change in velocity / time so force = mass × change in velocity / time... mass × change in velocity is momentum)\n(Therefore F = momentum change / time)" },
            { id: "p170", topic: "Forces", question: "What are crumple zones?", answer: "Areas at the front and back of a car which crumple up easily in a collision, increasing time taken to stop" },
            { id: "p171", topic: "Forces", question: "What happens to momentum in a closed system?", answer: "In a closed system momentum is always conserved" },

            // Unit 6: Waves
            { id: "p172", topic: "Waves", question: "What is a transverse wave?", answer: "A wave in which the vibration causing the wave is at right angles to direction of energy transfer" },
            { id: "p173", topic: "Waves", question: "Examples of transverse waves", answer: "Water waves and light waves" },
            { id: "p174", topic: "Waves", question: "What is a longitudinal wave?", answer: "A wave in which energy is transmitted along by pulling and pushing backwards and forwards (areas of compression and rarefaction)" },
            { id: "p175", topic: "Waves", question: "Examples of longitudinal waves", answer: "Sound waves" },
            { id: "p176", topic: "Waves", question: "What is amplitude?", answer: "The height of the wave measured from the middle" },
            { id: "p177", topic: "Waves", question: "What is wavelength?", answer: "The distance from one point on one wave to the equivalent on the next wave" },
            { id: "p178", topic: "Waves", question: "What is frequency?", answer: "Frequency is the number of waves produced each second. It is also the number of waves passing a point each second" },
            { id: "p179", topic: "Waves", question: "What is the formula of wave frequency?", answer: "T = 1 / f" },
            { id: "p180", topic: "Waves", question: "What is wave speed?", answer: "The speed at which the wave moves or the speed at which energy is transferred through the medium" },
            { id: "p181", topic: "Waves", question: "What is the formula of wave speed?", answer: "Wave speed = frequency × wavelength" },
            { id: "p182", topic: "Waves", question: "What happens when a wave travels from one medium to another?", answer: "The frequency stays the same but the speed and wavelength seem to change, this includes sound and light waves" },
            { id: "p183", topic: "Waves", question: "How does a mirror work?", answer: "It reflects light. A PLANE MIRROR IS A FLAT SURFACE MIRROR" },
            { id: "p184", topic: "Waves", question: "What is normal in terms of a reflection?", answer: "A line drawn at 90° to a surface" },
            { id: "p185", topic: "Waves", question: "What is the angle of incidence?", answer: "The angle between the incident ray and the normal" },
            { id: "p186", topic: "Waves", question: "Relation of angle incidence and reflection", answer: "Angle of incidence = angle of reflection" },
            { id: "p187", topic: "Waves", question: "What is a virtual image?", answer: "When the rays are diverging, so the light from the object appears to be coming from a completely different place" },
            { id: "p188", topic: "Waves", question: "What does a plane mirror produce?", answer: "Upright virtual image" },
            { id: "p189", topic: "Waves", question: "What happens to light when it hits a surface?", answer: "Reflected like in mirrors, transmitted or absorbed" },
            { id: "p190", topic: "Waves", question: "What happens in a medium that transmits light?", answer: "The light just passes through the medium but changes direction" },
            { id: "p191", topic: "Waves", question: "What happens in a medium that absorbs light?", answer: "Light does not pass through and is absorbed" },
            { id: "p192", topic: "Waves", question: "What are sound waves?", answer: "Vibrations that travel through a medium" },
            { id: "p193", topic: "Waves", question: "How are sound waves produced?", answer: "When an object vibrates like a tuning fork it creates compressions and rarefactions" },
            { id: "p194", topic: "Waves", question: "What do ears do?", answer: "Our ears help us detect sound. They convert sound waves into nerve impulses that are sent to the brain" },
            { id: "p195", topic: "Waves", question: "How does ear work?", answer: "Compression and rarefactions set in ear drum, this ear drum vibrates causing small bones to vibrate, the bones connect to nerves which give sensation of sound" },
            { id: "p196", topic: "Waves", question: "What is the range of human hearing?", answer: "20-20,000 Hz" },
            { id: "p197", topic: "Waves", question: "What are ultrasound waves?", answer: "Waves higher frequency than 20kHz" },
            { id: "p198", topic: "Waves", question: "Use of ultrasound", answer: "Can be used to explore inside bodies, directed at organ in a beam, at each surface some of the ultrasound is reflected, using a machine you can see the reflections building an image on the computer\nShips use them for sonar waves" },
            { id: "p199", topic: "Waves", question: "What are the two types of seismic waves?", answer: "P waves and S waves. They are produced by earthquakes" },
            { id: "p200", topic: "Waves", question: "What are P waves?", answer: "Longitudinal seismic waves. They travel at different speeds through solid and liquid rock" },
            { id: "p201", topic: "Waves", question: "What are S waves?", answer: "Transverse seismic waves. Only travel through solid" },
            { id: "p202", topic: "Waves", question: "What do seismic waves tell us about Earth?", answer: "Outer layer is solid as P and S waves can travel through\nOuter core is liquid because P waves travel\nInner core is solid, only P waves can travel as S waves cannot reach inner core" },
            { id: "p203", topic: "Waves", question: "What are electromagnetic waves?", answer: "Waves that are transverse that transfer energy from the source, they have a wavelength from about 10⁻¹² m to over 1 km" },
            { id: "p204", topic: "Waves", question: "Electromagnetic waves from shortest to longest", answer: "Gamma, X-ray, Ultraviolet, Visible light (red to violet), Infrared, Microwave, Radio waves" },
            { id: "p205", topic: "Waves", question: "Properties of electromagnetic waves", answer: "Transverse waves\nThey transfer energy from one place to another\nThey obey the equation: wave speed = frequency × wavelength\nThey travel through a vacuum at speed of 300,000,000 m/s" },
            { id: "p206", topic: "Waves", question: "What is refraction?", answer: "When a wave changes direction after entering a medium" },
            { id: "p207", topic: "Waves", question: "What is the angle of refraction?", answer: "The angle between the refracted ray and the normal" },
            { id: "p208", topic: "Waves", question: "Why is refraction caused?", answer: "Because waves change speed when they pass from one medium to another" },
            { id: "p209", topic: "Waves", question: "What happens when water waves go from deep to shallow?", answer: "When water is refracted:\nThe waves slow down\nBecome shorter in wavelength\nThey also change direction" },
            { id: "p210", topic: "Waves", question: "Use of electromagnetic waves", answer: "Radio waves used in TV, transmitted long distances\nMicrowaves are used for satellite communication, they pass through atmosphere\nMicrowaves also are used in microwaves\nInfrared waves provide heat so they can be used to heat up homes and also food\nInfrared cameras take photos at night, it is also used in remote control\nLight waves help us to see\nLasers are high energy light, used for LASIK eye surgery\nUltraviolet waves are emitted by hot objects, some substances can absorb the energy from ultraviolet radiation and then emit the energy as visible light\nX-rays can be used to see our bones" },
            { id: "p211", topic: "Waves", question: "What are the two types of lenses?", answer: "Concave and convex" },
            { id: "p212", topic: "Waves", question: "What is a convex lens?", answer: "Where the light refracts away from the normal and is converging" },
            { id: "p213", topic: "Waves", question: "What is the principal focus?", answer: "In a convex lens the principal focus is a point through which all the light rays parallel to the principal axis pass after refraction" },
            { id: "p214", topic: "Waves", question: "How is the image that the convex lens produces seen?", answer: "It forms a real image" },
            { id: "p215", topic: "Waves", question: "What is a real image?", answer: "A real image is formed when light rays converge to a point. A real image can be projected onto a screen" },
            { id: "p216", topic: "Waves", question: "What is the focal length?", answer: "The focal length is the distance between the lens and the principal focus" },
            { id: "p217", topic: "Waves", question: "What happens to the image of a convex lens?", answer: "It is inverted but the image is real as you can see it" },
            { id: "p218", topic: "Waves", question: "What is the equation for magnification?", answer: "Image height / object height" },
            { id: "p219", topic: "Waves", question: "What can a convex lens be used for?", answer: "Magnifying glass" },
            { id: "p220", topic: "Waves", question: "What happens when an object is placed in the focal length of a lens?", answer: "The image is virtual, upright and magnified" },
            { id: "p221", topic: "Waves", question: "What happens to the light in a convex lens?", answer: "It bends to one point called the focus" },
            { id: "p222", topic: "Waves", question: "What happens to the light in a concave lens?", answer: "It spreads out or diverges from a certain point" },
            { id: "p223", topic: "Waves", question: "What is a prism and what is it used for?", answer: "It is a glass pyramid that is used to split white light into different colours" },
            { id: "p224", topic: "Waves", question: "What is the order of light?", answer: "Red, Orange, Yellow, Green, Blue, Indigo, Violet\n(Really Opposed Yemenise Ginger In Virtual Reality / Richard Of York Gave Battle In Vain)" },
            { id: "p225", topic: "Waves", question: "What is specular reflection?", answer: "Occurs when light is reflected off a smooth surface in a single direction" },
            { id: "p226", topic: "Waves", question: "What is diffuse reflection?", answer: "Occurs when light is reflected at different angles across a rough surface" },
            { id: "p227", topic: "Waves", question: "What is opaque?", answer: "Something that does not allow light to pass through" },
            { id: "p228", topic: "Waves", question: "What gives something color?", answer: "Color of an object is determined by which wavelengths of light are most strongly reflected, any wavelengths which are not reflected are absorbed" },
            { id: "p229", topic: "Waves", question: "Why is something blue?", answer: "An object is blue because only blue light is reflected therefore all the other colors are absorbed" },
            { id: "p230", topic: "Waves", question: "What is a color filter?", answer: "Only allows a particular small range of wavelengths to pass through" },
            { id: "p231", topic: "Waves", question: "What is transparent?", answer: "An object that allows us to see clearly through it. This happens when objects transmit light like water and glass" },
            { id: "p232", topic: "Waves", question: "What is translucent?", answer: "Allows light to pass through but you can't see through it clearly, like plastic" },
            { id: "p233", topic: "Waves", question: "What is intensity of radiation?", answer: "The power of radiation incident per square meter" },
            { id: "p234", topic: "Waves", question: "What is a perfect black body?", answer: "One that absorbs all the radiation that is incident on it, it does not reflect or transmit any radiation" },
            { id: "p235", topic: "Waves", question: "How do clouds keep us warm?", answer: "It reflects the radiation that is being lost from the Earth causing it to retain the heat" },

            // Unit 7: Magnetism and Electromagnetism
            { id: "p236", topic: "Magnetism", question: "Examples of magnets", answer: "Iron, steel, cobalt and nickel" },
            { id: "p237", topic: "Magnetism", question: "What does magnetic mean?", answer: "A material that will be attracted by a magnet" },
            { id: "p238", topic: "Magnetism", question: "What is a north seeking pole?", answer: "The end of the magnet that points towards the north" },
            { id: "p239", topic: "Magnetism", question: "What is a south seeking pole?", answer: "The end of a magnet that points south" },
            { id: "p240", topic: "Magnetism", question: "What happens when you hold two like poles together?", answer: "They repel" },
            { id: "p241", topic: "Magnetism", question: "What happens when you hold two opposite poles together?", answer: "They attract" },
            { id: "p242", topic: "Magnetism", question: "What is a magnetic field?", answer: "The area around a magnet in which a force acts on a magnetic object or maybe another magnet" },
            { id: "p243", topic: "Magnetism", question: "What is relationship between size of the magnetic field and force?", answer: "Big field means big force, small field means weak/small force" },
            { id: "p244", topic: "Magnetism", question: "How can you find the pole of a magnet?", answer: "By using a compass and putting it near. The needle of the compass always points along the field" },
            { id: "p245", topic: "Magnetism", question: "The closer you are to a magnet the stronger the...?", answer: "Magnetic field and force attraction" },
            { id: "p246", topic: "Magnetism", question: "What is a compass?", answer: "A small bar magnet that can rotate in the instrument which points towards the north and south" },
            { id: "p247", topic: "Magnetism", question: "The north hand of the compass contains the...", answer: "South pole of the compass because opposite charges attract" },
            { id: "p248", topic: "Magnetism", question: "What is a permanent magnet?", answer: "An object that produces its own magnetic field" },
            { id: "p249", topic: "Magnetism", question: "What is an induced magnet?", answer: "An object that becomes magnetic when it is placed in a magnetic field" },
            { id: "p250", topic: "Magnetism", question: "What is a solenoid?", answer: "A long coil of wire and when a current is passed through it becomes magnetic similar to a bar magnet" },
            { id: "p251", topic: "Magnetism", question: "How to increase the magnetic field in a solenoid?", answer: "Using a larger current\nMore turns of wire\nPutting the turns closer\nPutting an iron core into the middle of the solenoid" },
            { id: "p252", topic: "Magnetism", question: "What is a relay?", answer: "A device that uses a small current to control a much larger current in a different circuit" },
            { id: "p253", topic: "Magnetism", question: "What is magnetic flux?", answer: "Magnetic flux is the total number of magnetic field lines" },
            { id: "p254", topic: "Magnetism", question: "What is magnetic flux density/flux density?", answer: "The number of lines of magnetic flux in a given area" },
            { id: "p255", topic: "Magnetism", question: "How to calculate the force on a wire?", answer: "Force = magnetic flux density × current × length" },
            { id: "p256", topic: "Magnetism", question: "What is the motor effect?", answer: "A force experienced by a current-carrying wire in a magnetic field" },
            { id: "p257", topic: "Magnetism", question: "Why does the motor effect happen?", answer: "Interaction between the two magnetic fields, one from the permanent magnet and one from the current" },
            { id: "p258", topic: "Magnetism", question: "What does the force acting on the foil depend on?", answer: "The magnetic flux density between the poles\nThe size of the current\nThe length of the foil between the poles" },
            { id: "p259", topic: "Magnetism", question: "What is Fleming's left hand rule used for?", answer: "To predict the direction in which a straight conductor moves in the magnetic field" },
            { id: "p260", topic: "Magnetism", question: "Based on the left hand rule, when will the direction of the force reverse?", answer: "If the magnetic field direction is reversed\nIf the direction of the current is reversed" },
            { id: "p261", topic: "Magnetism", question: "What is an induced potential difference?", answer: "A potential difference produced when a conducting wire moves through a magnetic field" },
            { id: "p262", topic: "Magnetism", question: "What is induced current?", answer: "In a complete circuit the potential difference will cause a current in the circuit, this is an induced current" },
        ]
    },
    {
        subject: "English Language",
        cards: [
            // Source: https://knowt.com/flashcards/0bdb6562-d015-4596-ad0c-2b3fd1eeb135
            { id: "e1", topic: "Paralinguistics", question: "What are Paralinguistic Features?", answer: "1. Vocal effects (whispers, laughter)\n2. Non-verbal communication (gestures, facial expressions, eye contact)\n3. Creakiness, breathiness" },
            { id: "e2", topic: "Discourse", question: "What are conversational/discourse strategies (TTMC)?", answer: "TTMC:\n- Topic Management\n- Turn-Taking\n- Management of repair sequences\n- Codeswitching" },
            { id: "e3", topic: "Phonology", question: "What are connected speech processes?", answer: "Assimilation, vowel reduction, insertion, elision" },
            { id: "e4", topic: "Discourse", question: "What are features of Spoken Discourse (BODONA)?", answer: "BODONA:\n- Backchannels/minimal responses\n- Openings/closings\n- Discourse particles\n- Overlapping speech\n- Non-fluency features\n- Adjacency pairs" },
            { id: "e5", topic: "Morphology", question: "List word formation processes", answer: "Affixation, abbreviation, shortening, compounding, blending, backformation, conversion, initialism, acronym, contraction" },
            { id: "e6", topic: "Morphology", question: "What is backformation?", answer: "The formation of a new word through the mistaken belief that part of a word is an affix and can be removed.\ne.g., gloomy → gloom, editor → edit" },
            { id: "e7", topic: "Grammar", question: "What is a superlative?", answer: "Adjective/adverb expressing the highest degree of a quality (e.g., bravest, most fiercely)." },
            { id: "e8", topic: "Pragmatics", question: "What are face threatening acts?", answer: "Acts that threaten Negative Face (impede independence/freedom) or Positive Face (disappearing of wants/needs)." },
            { id: "e9", topic: "Morphology", question: "Define morphological patterning types", answer: "Shortenings (vowel affix), Blends (combining words), Initialisms (letters said individually), Acronyms (letters said as word), Compounds (two free morphemes), Conversion (changing word class)." },
            { id: "e10", topic: "Syntax", question: "What is syntactic patterning?", answer: "Parallelism, antithesis, listing" },
            { id: "e11", topic: "Morphology", question: "What is Affixation?", answer: "Combining a root and an affix (prefix, infix, suffix).\ne.g., untrue, abso-bloody-lutely, friendly" },
            { id: "e12", topic: "Morphology", question: "What is Blending?", answer: "Combining parts of two independent words.\ne.g., Malware (malicious+software), Smog (smoke+fog)" },
            { id: "e13", topic: "Lexicology", question: "What is Borrowing?", answer: "Acquiring words from another language.\ne.g., Giraffe (Arabic), Cargo (Spanish), Latte (Italian)" },
            { id: "e14", topic: "Lexicology", question: "What is Collocation?", answer: "Words that tend to occur in close association.\ne.g., hard-earned money, fast food" },
            { id: "e15", topic: "Semantics", question: "What is a hypernym?", answer: "The label given to the overarching topic (the category name)." },
            { id: "e16", topic: "Lexicology", question: "What is Commonisation?", answer: "Replacing technical terms with brand-based words.\ne.g., 'google it', 'Band Aid'" },
            { id: "e17", topic: "Morphology", question: "What is Compounding?", answer: "Combining two words that already exist.\ne.g., Mouthwash, Carport" },
            { id: "e18", topic: "Morphology", question: "What is Contraction?", answer: "A reduced form where middle letters are removed.\ne.g., can't, won't, it's" },
            { id: "e19", topic: "Lexicology", question: "What is a Neologism?", answer: "A newly coined word or expression to fill a gap.\ne.g., tweeting" },
            { id: "e20", topic: "Phonology", question: "What is Alliteration?", answer: "Repetition of consonant sounds in consecutive words.\ne.g., Wonderful winter wonderland." },
            { id: "e21", topic: "Phonology", question: "What is Assonance?", answer: "Repetition of identical vowel sounds.\ne.g., 'No pay, no play'" },
            { id: "e22", topic: "Phonology", question: "What is Consonance?", answer: "Repetition of identical consonant sounds.\ne.g., 'A stroke of luck', 'Odds and ends'" },
            { id: "e23", topic: "Phonology", question: "What is Rhyme?", answer: "Words agreeing in the central peak syllable and following consonants.\ne.g., Bright light" },
            { id: "e24", topic: "Phonology", question: "What is Rhythm?", answer: "The flow of words produced by patterns of stress and tempo." },
            { id: "e25", topic: "Syntax", question: "What is Antithesis?", answer: "Juxtaposition of contrasting words/ideas that are similarly structured.\ne.g., 'Big on comfort, small on price'" },
            { id: "e26", topic: "Syntax", question: "What is Apposition?", answer: "Two nouns/phrases describing the same thing alongside each other.\ne.g., 'Mr Smith, the local locksmith'" },
            { id: "e27", topic: "Syntax", question: "What is Ellipsis?", answer: "Omission of words necessary for syntax but not understanding.\ne.g., 'Coming to the party?'" },
            { id: "e28", topic: "Syntax", question: "What is Front Focus?", answer: "Moving a clause element other than subject to the beginning.\ne.g., 'Very slowly, John walked...'" },
            { id: "e29", topic: "Syntax", question: "What is End Focus?", answer: "Moving new/important info to the end.\ne.g., 'They are excellent students, the Year 12s.'" },
            { id: "e30", topic: "Morphology", question: "What is Nominalisation?", answer: "Forming a noun from a verb or clause.\ne.g., 'We walked' -> 'The walk'" },
            { id: "e31", topic: "Discourse", question: "What is Anaphoric referencing?", answer: "Referring back to something already mentioned.\ne.g., 'The fish was fresh, so IT tasted delicious'" },
            { id: "e32", topic: "Discourse", question: "What is Cataphoric referencing?", answer: "Referring forward to something not yet mentioned.\ne.g., '...SHE was ugly, but Prince Charming thought CINDERELLA...'" },
            { id: "e33", topic: "Discourse", question: "What is Substitution?", answer: "Replacing a linguistic term with another (often a filler).\ne.g., 'Do you have ONE?'" },
            { id: "e34", topic: "Semantics", question: "What is Personification?", answer: "Giving non-human things human qualities.\ne.g., 'The wind howled'" },
            { id: "e35", topic: "Semantics", question: "What is Connotation?", answer: "The idea or meaning associated with a word (positive/negative).\ne.g., Mother (caring vs concern)" },
            { id: "e36", topic: "Semantics", question: "What is Denotation?", answer: "The literal dictionary definition of a word." },
            { id: "e37", topic: "Semantics", question: "What is a Euphemism?", answer: "Substitution of a mild term for a harsh one.\ne.g., 'pass away' for 'die'" },
            { id: "e38", topic: "Semantics", question: "What is a Dysphemism?", answer: "Substitution of an offensive term for an inoffensive one.\ne.g., 'pig' for policeman" },
            { id: "e39", topic: "Semantics", question: "What is Hyperbole?", answer: "Exaggeration for emphasis.\ne.g., 'I could eat an elephant'" },
            { id: "e40", topic: "Semantics", question: "What is an Idiom?", answer: "Expression meaning something other than literal words.\ne.g., 'Raining cats and dogs'" },
            { id: "e41", topic: "Semantics", question: "What is Lexical Ambiguity?", answer: "When a word involves more than one meaning.\ne.g., 'The teacher raved' (angry or happy?)" },
            { id: "e42", topic: "Phonology", question: "What is Elision?", answer: "Omitting a sound to make speech easier.\ne.g., 'cos, goin', 'n" },
            { id: "e43", topic: "Phonology", question: "What is Insertion?", answer: "Introducing a sound between others.\ne.g., drawing (draw-ring)" },
            { id: "e44", topic: "Discourse", question: "What is an Adjacency pair?", answer: "Two-part exchanges following a pattern.\ne.g., How are you? -> Yeah good." },
            { id: "e45", topic: "Discourse", question: "What is Backchanneling?", answer: "Short responses by audience to indicate listening (yeah, hmm, ok)." },
            { id: "e46", topic: "Discourse", question: "What is a Discourse Particle?", answer: "Words communicating topic change, turn-taking, etc.\ne.g., well, yep, sort of, like" },
            { id: "e47", topic: "Discourse", question: "What is a False Start?", answer: "Hesitating or changing mind after beginning an utterance.\ne.g., 'I drove my- I took the Camry'" },
            { id: "e48", topic: "Discourse", question: "What is a Formulaic Expression?", answer: "Language following a set pattern (openings/closings).\ne.g., 'Welcome to AAMI...'" },
            { id: "e49", topic: "Discourse", question: "What is a Hedging Expression?", answer: "Word/phrase making statement less forceful.\ne.g., perhaps, hopefully, sort of" },
            { id: "e50", topic: "Grammar", question: "What is a Tag Question?", answer: "Turning a statement into a question.\ne.g., 'Take care, won't you?'" },
            { id: "e51", topic: "Discourse", question: "What is a Pause Filler?", answer: "Expressions like 'um', 'err' used to hold the floor." },
            { id: "e52", topic: "Discourse", question: "What is Phatic Communication?", answer: "Small talk/social chit-chat to maintain relationships." },
            { id: "e53", topic: "Pragmatics", question: "What is a Politeness Marker?", answer: "Expressions showing courtesy/social status.\ne.g., please, thank you" },
            { id: "e54", topic: "Grammar", question: "What is a Vocative?", answer: "A lexeme used to address or refer to someone.\ne.g., 'John...', 'Waiter...'" },
            { id: "e55", topic: "Grammar", question: "What is a Clause?", answer: "Subject-verb combination. Can be Independent or Dependent." },
            { id: "e56", topic: "Grammar", question: "What is a Complex Sentence?", answer: "One independent clause + one or more dependent clauses." },
            { id: "e57", topic: "Grammar", question: "What is a Compound-Complex Sentence?", answer: "Two+ independent clauses + at least one dependent clause." },
            { id: "e58", topic: "Discourse", question: "What is Inference?", answer: "Knowledge brought to text by reader not explicitly expressed." },
            { id: "e59", topic: "Discourse", question: "What is Coherence (FLLICC)?", answer: "Semantic connections making text meaningful.\nFLLICC: Formatting, Listing, Logical ordering, Inference, Consistency, Cohesion" },
            { id: "e60", topic: "Discourse", question: "What is Cohesion (SIR CLEAR II)?", answer: "Linguistic connections giving structure.\nSubstitution, Information flow, Referencing, Conjunctions, Lexical choice, Ellipsis, Adverbials, Repetition" },
            { id: "e61", topic: "Discourse", question: "What are Non-fluency features?", answer: "False starts, interruptions, self corrections, repetitions, hesitations, fillers." },
            { id: "e62", topic: "Syntax", question: "What is Clefting?", answer: "Moving an element to a separate clause for emphasis.\ne.g., 'It was Di who read...'" },
            { id: "e63", topic: "Sociolinguistics", question: "What is an Accent?", answer: "Pronunciation variety identified with background." },
            { id: "e64", topic: "Grammar", question: "What is Active Voice?", answer: "Subject performs the action. Direct.\ne.g., Everyone deserves a break." },
            { id: "e65", topic: "Grammar", question: "What is an Agentless Passive?", answer: "Passive voice without specifying the doer.\ne.g., 'All the chocolate was eaten'" },
            { id: "e66", topic: "Lexicology", question: "What is an Archaism?", answer: "Word construction no longer in common use.\ne.g., hitherto" },
            { id: "e67", topic: "Grammar", question: "What are Auxiliary Verbs?", answer: "Helping verbs indicating tense/mood.\ne.g., be, do, have, will, can" },
            { id: "e68", topic: "Sociolinguistics", question: "What is Covert Prestige?", answer: "Value attached to non-standard language by a sub-group." },
            { id: "e69", topic: "Sociolinguistics", question: "What is Overt Prestige?", answer: "Prestige attached to standard variants (education/power)." },
            { id: "e70", topic: "Sociolinguistics", question: "What is a Creole?", answer: "A nativised pidgin that has become a mother tongue." },
            { id: "e71", topic: "Morphology", question: "What is a Diminutive?", answer: "Suffix indicating smallness or affection.\ne.g., Tassie, Salvo" },
            { id: "e72", topic: "Discourse", question: "What is Discourse?", answer: "Sequences of language larger than a sentence." },
            { id: "e73", topic: "Semantics", question: "What is Doublespeak?", answer: "Language deliberately distorting meaning to mislead.\ne.g., 'sanitary technician' (garbage man)" },
            { id: "e74", topic: "Pragmatics", question: "What are Positive Politeness Strategies?", answer: "Emphasising similarity, interest, humour, compliments, inclusive language." },
            { id: "e75", topic: "Pragmatics", question: "What are Negative Politeness Strategies?", answer: "Hedging, being indirect, low modality, apologising." },
            { id: "e76", topic: "Pragmatics", question: "What is Positive Face?", answer: "Need for closeness/solidarity. Noticing others' wants/needs." },
            { id: "e77", topic: "Pragmatics", question: "What is Negative Face?", answer: "Need to be independent and not imposed upon." },
            { id: "e78", topic: "Semantics", question: "What is Figurative Language?", answer: "Non-literal language (metaphors, similes, etc)." },
            { id: "e79", topic: "Grammar", question: "What is an Intensifier?", answer: "Word adding emphasis.\ne.g., very, terribly" },
            { id: "e80", topic: "Lexicology", question: "What is Jargon?", answer: "Specialist language of a group/profession for precision or solidarity." },
            { id: "e81", topic: "Syntax", question: "What is Left-dislocation?", answer: "Moving constituent to start, leaving pronoun.\ne.g., 'Ice cream, I just love it.'" },
            { id: "e82", topic: "Lexicology", question: "What is Lexicon?", answer: "The vocabulary of a language." },
            { id: "e83", topic: "Morphology", question: "What is a Morpheme?", answer: "Smallest meaningful unit of grammar." },
            { id: "e84", topic: "Discourse", question: "What is Orthography?", answer: "Spelling and typographical elements (bolding, punctuation)." },
            { id: "e85", topic: "Syntax", question: "What is Right-dislocation?", answer: "Moving constituent to end, leaving pronoun.\ne.g., 'I love it, that movie.'" },
            { id: "e86", topic: "Sociolinguistics", question: "What is a Sociolect?", answer: "Variety used by people of a particular SES/background." },
            { id: "e87", topic: "Sociolinguistics", question: "What is an Ethnolect?", answer: "Variety associated with an ethnic/cultural subgroup." },
            { id: "e88", topic: "Semantics", question: "What does Semantics cover?", answer: "Meaning (Figurative language, Irony, Metaphor, Puns, Ambiguity, etc)." },
            { id: "e89", topic: "Sociolinguistics", question: "What is Register?", answer: "Style of language determined by context, purpose, audience." },
            { id: "e90", topic: "Sociolinguistics", question: "What is Identity in language?", answer: "Values/background seen through language use." },
            { id: "e91", topic: "Semantics", question: "What is Understatement?", answer: "Deliberately weakening a statement (irony/politeness).\ne.g., 'I know a little...' (expert)" },
            { id: "e92", topic: "Sociolinguistics", question: "What is a Dialect?", answer: "Subset of language with own vocab/grammar/pronunciation." },
            { id: "e93", topic: "Phonology", question: "What is Non-rhoticity?", answer: "Not pronouncing the 'r' (Australian feature).\ne.g., Caa vs Car" },
            { id: "e94", topic: "Grammar", question: "What is a Personal Pronoun?", answer: "Substitutes for a noun (person/place/thing)." },
            { id: "e95", topic: "Grammar", question: "What is a Demonstrative Pronoun?", answer: "Points to specific nouns (that, these, those)." },
            { id: "e96", topic: "Phonology", question: "What is Phonological Patterning?", answer: "Alliteration, assonance, rhyme, consonance, rhythm, onomatopoeia." },
            { id: "e97", topic: "Phonology", question: "What are Monophthongs?", answer: "Vowels with one place of articulation (hArd)." },
            { id: "e98", topic: "Phonology", question: "What are Diphthongs?", answer: "Vowels with two places of articulation (ahOy)." },
            { id: "e99", topic: "Paralinguistics", question: "What are Vocal Effects?", answer: "Whisper and laughter." },
            { id: "e100", topic: "Phonology", question: "What is Assimilation?", answer: "Sound changing to resemble neighbour.\ne.g., don't you -> donchu" },
            { id: "e101", topic: "Phonology", question: "What is Vowel Reduction?", answer: "Leaving off/reducing vowels for easier articulation.\ne.g., Rosa's roses (schwa sound)." },
            { id: "e102", topic: "Sociolinguistics", question: "What is Broad Australian English?", answer: "Stereotypical, distinctive, associated with mateship." },
            { id: "e103", topic: "Sociolinguistics", question: "What is Cultivated Australian English?", answer: "Associated with high class/education, less prestige now." },
            { id: "e104", topic: "Sociolinguistics", question: "What is General Australian Accent?", answer: "Majority accent, heard in media." },
            { id: "e105", topic: "Phonology", question: "What is Rhythm (example)?", answer: "Patterns of stress.\ne.g., shall I comPARE thee..." },
            { id: "e106", topic: "Phonology", question: "What is Rhyme (example)?", answer: "Recurrent syllables of similar sounds." },
            { id: "e107", topic: "Morphology", question: "What are Blends?", answer: "Combining words (brunch)." },
            { id: "e108", topic: "Morphology", question: "What are Acronyms?", answer: "First letters said as a WORD (NASA)." },
            { id: "e109", topic: "Morphology", question: "What are Initialisms?", answer: "First letters said as LETTERS (FBI)." },
            { id: "e110", topic: "Morphology", question: "What is Shortening?", answer: "Dropping endings/beginnings (bio, kindy)." },
            { id: "e111", topic: "Morphology", question: "What are Contractions?", answer: "Shortening with apostrophe (can't)." },
            { id: "e112", topic: "Syntax", question: "What is Ellipses (Cohesion)?", answer: "Omitting parts to prevent repetition." },
            { id: "e113", topic: "Morphology", question: "What is Nominalisation (function)?", answer: "Turning verb to noun. Reduces clauses, removes agent, increases formality." },
            { id: "e114", topic: "Grammar", question: "What is the Subject?", answer: "Active agent doing the verb." },
            { id: "e115", topic: "Grammar", question: "What is the Object?", answer: "Receive of the verb action." },
            { id: "e116", topic: "Grammar", question: "What is a Complement?", answer: "Phrase providing extra info about subject/object." },
            { id: "e117", topic: "Grammar", question: "What are Adverbials?", answer: "Words/phrases providing info on time, place, manner." },
            { id: "e118", topic: "Grammar", question: "What is Passive Voice?", answer: "Focus on object.\ne.g., The ladybug was seen by Zach." },
            { id: "e119", topic: "Syntax", question: "What is Parallelism?", answer: "Similar sentence structures for cohesion/memorability.\ne.g., I came, I saw, I conquered." },
            { id: "e120", topic: "Semantics", question: "What is a Semantic Domain?", answer: "Lexemes grouped by interrelated meanings (topic)." },
            { id: "e121", topic: "Semantics", question: "What is Irony?", answer: "Implying opposite of literal meaning." },
            { id: "e122", topic: "Semantics", question: "What is a Metaphor?", answer: "Non-literal comparison." },
            { id: "e123", topic: "Semantics", question: "What is an Oxymoron?", answer: "Contradictory words combined (deafening silence)." },
            { id: "e124", topic: "Semantics", question: "What is a Simile?", answer: "Comparison using 'as' or 'like'." },
            { id: "e125", topic: "Semantics", question: "What is Animation?", answer: "Giving life/movement to inanimate objects (doesn't have to be human)." },
            { id: "e126", topic: "Semantics", question: "What are Puns?", answer: "Play on double meanings." },
            { id: "e127", topic: "Semantics", question: "What are Synonyms?", answer: "Similar meanings." },
            { id: "e128", topic: "Semantics", question: "What are Antonyms?", answer: "Opposite meanings." },
            { id: "e129", topic: "Semantics", question: "What are Hyponyms?", answer: "Specific words within a category (netball is hyponym of sport)." },
            { id: "e130", topic: "Semantics", question: "What is Denotation (Semantics)?", answer: "Literal definition." },
            { id: "e131", topic: "Semantics", question: "What is Connotation (Semantics)?", answer: "Associated meaning." },
            { id: "e132", topic: "Lexicology", question: "What is Collocation (Lexicology)?", answer: "Words occurring in close association." },
            { id: "e133", topic: "Discourse", question: "What is Inference (Discourse)?", answer: "Implied meaning brought by reader." },
            { id: "e134", topic: "Discourse", question: "What is Logical Ordering?", answer: "Structuring text visually/textually sensibly." },
            { id: "e135", topic: "Discourse", question: "What is Formatting?", answer: "Headings, typography, bullet points, images." },
            { id: "e136", topic: "Discourse", question: "What is Consistency?", answer: "Adhering to conventions and semantic fields." },
            { id: "e137", topic: "Discourse", question: "What is Information Flow?", answer: "Manipulating order of info (front/end focus) for priority." },
            { id: "e138", topic: "Discourse", question: "What are Deictics?", answer: "Space/time/person words needing context (here, there, him)." },
            { id: "e139", topic: "Discourse", question: "What is Repetition?", answer: "Reinforcing topic/cohesion." },
            { id: "e140", topic: "Discourse", question: "What is Substitution (Discourse)?", answer: "Replacing element to avoid repetition." },
            { id: "e141", topic: "Discourse", question: "What are Openings/Closings?", answer: "Signaling start/end of text/convo." },
            { id: "e142", topic: "Discourse", question: "What is Overlapping Speech?", answer: "Second speaker taking floor, interjecting, or encouraging." },
            { id: "e143", topic: "Discourse", question: "What are Interrogative Tags?", answer: "Added to end of sentence to seek confirmation/uncertainty." },
            { id: "e144", topic: "Discourse", question: "What are Pauses?", answer: "Breathing, grammatical boundaries, or hesitation." },
            { id: "e145", topic: "Discourse", question: "What are False Starts?", answer: "Restarting speech after error." },
            { id: "e146", topic: "Discourse", question: "What are Repairs?", answer: "Mending speech errors (Self/Other initiated)." },
            { id: "e147", topic: "Discourse", question: "What is Topic Management?", answer: "Initiating, changing, looping, maintaining topics." },
            { id: "e148", topic: "Discourse", question: "What are Turn-taking strategies?", answer: "Take, hold, pass floor. Cues/feedback." },
            { id: "e149", topic: "Discourse", question: "What is Taking the Floor?", answer: "Beginning to speak (body language, intake of breath)." },
            { id: "e150", topic: "Discourse", question: "What is Holding the Floor?", answer: "Continuing to speak, resisting interruption." },
            { id: "e151", topic: "Discourse", question: "What is Passing the Floor?", answer: "Gesturing/signaling for another to speak." },
            { id: "e152", topic: "Sociolinguistics", question: "What are Overt Norms?", answer: "Obvious conventions (standard dialects)." },
            { id: "e153", topic: "Sociolinguistics", question: "What are Covert Norms?", answer: "Subtle conventions (in-group slang)." },
            { id: "e154", topic: "Sociolinguistics", question: "What is Standard English?", answer: "Accepted 'proper' variety (education/institutions)." },
            { id: "e155", topic: "Sociolinguistics", question: "What is Non-Standard English?", answer: "Seen as 'wrong' (grammar/vocab)." },
            { id: "e156", topic: "Sociolinguistics", question: "What is Non-discriminatory language?", answer: "Avoiding language that insults minority groups." },
            { id: "e157", topic: "Lexicology", question: "What is Slang?", answer: "Transient, group-specific informal language." },
            { id: "e158", topic: "Lexicology", question: "What is Colloquial Language?", answer: "Permanent informal register (relaxed, casual)." },
            { id: "e159", topic: "Lexicology", question: "What is Taboo language?", answer: "Profanity, obscenity, expletives, slurs, epithets." },
            { id: "e160", topic: "Sociolinguistics", question: "What is Public Language?", answer: "Formal register used in politics, media, law." },
            { id: "e161", topic: "Discourse", question: "What is Situational Context?", answer: "Field, Tenor, Mode, Setting, Text Type." },
            { id: "e162", topic: "Sociolinguistics", question: "What is Cultural Context?", answer: "Values, attitudes, beliefs influencing language." },
            { id: "e163", topic: "Sociolinguistics", question: "What is Idiolect?", answer: "A person's specific linguistic fingerprint/habits." },
        ]
    },
];

export default function Grade9Flashcards() {
    const { supabase, user } = useAuth();
    const navigate = useNavigate();
    const [isPremium, setIsPremium] = useState(false);
    const [checkingPremium, setCheckingPremium] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState(flashcardData[0].subject);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [shuffledCards, setShuffledCards] = useState<Flashcard[]>([]);

    const currentSet = flashcardData.find(s => s.subject === selectedSubject);
    const cards = shuffledCards.length > 0 ? shuffledCards : (currentSet?.cards || []);
    const currentCard = cards[currentCardIndex];

    useEffect(() => {
        if (user) {
            checkPremiumStatus();
        } else {
            setCheckingPremium(false);
        }
    }, [user]);

    useEffect(() => {
        // Reset when subject changes
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setShuffledCards([]);
    }, [selectedSubject]);

    const checkPremiumStatus = async () => {
        if (!user || !supabase) return;
        try {
            const premium = await hasPremium(supabase);
            setIsPremium(premium);
        } catch (error) {
            console.error("Error checking premium status:", error);
        } finally {
            setCheckingPremium(false);
        }
    };

    const handleNext = () => {
        if (currentCardIndex < cards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
            setIsFlipped(false);
        }
    };

    const handlePrevious = () => {
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1);
            setIsFlipped(false);
        }
    };

    const handleShuffle = () => {
        const shuffled = [...(currentSet?.cards || [])].sort(() => Math.random() - 0.5);
        setShuffledCards(shuffled);
        setCurrentCardIndex(0);
        setIsFlipped(false);
    };

    const handleReset = () => {
        setShuffledCards([]);
        setCurrentCardIndex(0);
        setIsFlipped(false);
    };

    if (checkingPremium) {
        return (
            <AppLayout>
                <div className="max-w-6xl mx-auto flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AppLayout>
        );
    }

    if (!isPremium) {
        return (
            <AppLayout>
                <div className="max-w-4xl mx-auto animate-fade-in">
                    <div className="glass-card p-12 text-center">
                        <div className="relative inline-block mb-6">
                            <Layers className="h-20 w-20 text-muted-foreground/50" />
                            <div className="absolute -top-2 -right-2 p-2 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600">
                                <Lock className="h-5 w-5 text-white" />
                            </div>
                        </div>

                        <h1 className="text-3xl font-bold text-foreground mb-4">
                            Grade 9 Premium Flashcards
                        </h1>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                            Unlock exclusive Grade 9 flashcards designed to help you commit key concepts to memory.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
                                onClick={() => navigate("/premium-dashboard")}
                            >
                                <Crown className="h-5 w-5 mr-2" />
                                Upgrade to Premium
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => navigate(-1)}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Go Back
                            </Button>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto animate-fade-in pb-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-500/20">
                            <Layers className="w-8 h-8 text-yellow-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl sm:text-3xl font-bold">Grade 9 Flashcards</h1>
                                <Badge className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Premium
                                </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm">
                                Master key concepts for top marks
                            </p>
                        </div>
                    </div>
                </div>

                {/* Subject Selection */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                        <SelectContent>
                            {flashcardData.map(set => (
                                <SelectItem key={set.subject} value={set.subject}>
                                    {set.subject}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex gap-2 ml-auto">
                        <Button variant="outline" size="sm" onClick={handleShuffle}>
                            <Shuffle className="h-4 w-4 mr-1" />
                            Shuffle
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleReset}>
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Reset
                        </Button>
                    </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 transition-all duration-300"
                            style={{ width: `${((currentCardIndex + 1) / cards.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">
                        {currentCardIndex + 1} / {cards.length}
                    </span>
                </div>

                {/* Flashcard */}
                {currentCard && (
                    <div className="mb-6">
                        <div
                            className="flashcard-container relative w-full min-h-[350px] sm:min-h-[400px] cursor-pointer"
                            onClick={() => setIsFlipped(!isFlipped)}
                        >
                            <div className={cn(
                                "flashcard-inner absolute inset-0",
                                isFlipped && "flipped"
                            )}>
                                {/* Front - Question */}
                                <Card className={cn(
                                    "flashcard-face p-6 sm:p-8 flex flex-col",
                                    "bg-gradient-to-br from-background to-muted/30 border-2"
                                )}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Badge variant="secondary" className="text-xs">
                                            {currentCard.topic}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">Click to flip</span>
                                    </div>
                                    <div className="flex-1 flex items-center justify-center">
                                        <h2 className="text-xl sm:text-2xl font-semibold text-center leading-relaxed">
                                            {currentCard.question}
                                        </h2>
                                    </div>
                                    <div className="text-center text-muted-foreground text-sm mt-4">
                                        Question
                                    </div>
                                </Card>

                                {/* Back - Answer */}
                                <Card className={cn(
                                    "flashcard-face flashcard-back p-6 sm:p-8 flex flex-col",
                                    "bg-gradient-to-br from-yellow-500/5 to-amber-500/10 border-2 border-yellow-500/30"
                                )}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Badge className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30 text-xs">
                                            {currentCard.topic}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">Click to flip back</span>
                                    </div>
                                    <div className="flex-1 flex items-center justify-center">
                                        <p className="text-base sm:text-lg text-center leading-relaxed whitespace-pre-line">
                                            {currentCard.answer}
                                        </p>
                                    </div>
                                    <div className="text-center text-yellow-600 text-sm mt-4">
                                        Answer
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentCardIndex === 0}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                    </Button>

                    <div className="flex gap-1">
                        {cards.slice(0, 10).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setCurrentCardIndex(idx); setIsFlipped(false); }}
                                className={cn(
                                    "w-2.5 h-2.5 rounded-full transition-all",
                                    currentCardIndex === idx
                                        ? "bg-yellow-500 scale-125"
                                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                                )}
                            />
                        ))}
                        {cards.length > 10 && (
                            <span className="text-xs text-muted-foreground ml-1">+{cards.length - 10}</span>
                        )}
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleNext}
                        disabled={currentCardIndex === cards.length - 1}
                        className="gap-2"
                    >
                        Next
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>

                {/* Subject Stats */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {flashcardData.map(set => (
                        <button
                            key={set.subject}
                            onClick={() => setSelectedSubject(set.subject)}
                            className={cn(
                                "p-3 rounded-xl text-left transition-all",
                                selectedSubject === set.subject
                                    ? "bg-yellow-500/20 border border-yellow-500/50"
                                    : "bg-muted/50 hover:bg-muted border border-transparent"
                            )}
                        >
                            <div className="font-medium text-sm truncate">{set.subject}</div>
                            <div className="text-xs text-muted-foreground">{set.cards.length} cards</div>
                        </button>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
