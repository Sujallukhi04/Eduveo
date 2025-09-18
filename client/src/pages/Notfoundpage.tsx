import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { BookOpen, Search, Smile, Check, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import confetti from 'canvas-confetti';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const questions = [
    {
      question: "What famous equation is often associated with Albert Einstein?",
      answers: ["E = mc^2", "F = ma", "a^2 + b^2 = c^2", "PV = nRT"],
      correct: 0,
    },
    {
      question: "Which planet in our solar system is known as the 'Red Planet'?",
      answers: ["Venus", "Jupiter", "Mars", "Saturn"],
      correct: 2,
    },
    {
      question: "What is the capital of Japan?",
      answers: ["Seoul", "Beijing", "Bangkok", "Tokyo"],
      correct: 3,
    },
    {
      question: "Who painted the Mona Lisa?",
      answers: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Michelangelo"],
      correct: 2,
    },
    {
      question: "What is the largest organ in the human body?",
      answers: ["Heart", "Brain", "Liver", "Skin"],
      correct: 3,
    },
    {
      question: "What is the smallest unit of matter?",
      answers: ["Atom", "Molecule", "Electron", "Quark"],
      correct: 0,
    },
    {
      question: "What is the name of the first artificial satellite launched into space?",
      answers: ["Voyager 1", "Sputnik 1", "Apollo 11", "Hubble"],
      correct: 1,
    },
    {
      question: "Which ancient civilization built the pyramids of Giza?",
      answers: ["Romans", "Mayans", "Egyptians", "Aztecs"],
      correct: 2,
    },
    {
      question: "Which element has the chemical symbol 'O'?",
      answers: ["Oxygen", "Gold", "Osmium", "Onyx"],
      correct: 0,
    },
    {
      question: "Which fictional detective is famous for living at 221B Baker Street?",
      answers: ["Hercule Poirot", "Sherlock Holmes", "Nancy Drew", "Miss Marple"],
      correct: 1,
    },
    {
      question: "What is the hardest natural substance on Earth?",
      answers: ["Diamond", "Gold", "Iron", "Graphite"],
      correct: 0,
    },
    {
      question: "In which year did Neil Armstrong land on the moon?",
      answers: ["1965", "1969", "1972", "1967"],
      correct: 1,
    },
    {
      question: "Which gas is most abundant in Earth's atmosphere?",
      answers: ["Oxygen", "Hydrogen", "Nitrogen", "Carbon Dioxide"],
      correct: 2,
    },
    {
      question: "Which famous ship sank on its maiden voyage in 1912?",
      answers: ["Queen Mary", "Titanic", "Lusitania", "Bismarck"],
      correct: 1,
    },
    {
      question: "What is the tallest mountain in the world?",
      answers: ["Mount Kilimanjaro", "Mount Everest", "K2", "Mount Denali"],
      correct: 1,
    },
  ];
  

  const handleAnswer = (answerIndex: number) => {
    setIsCorrect(answerIndex === questions[currentQuestion].correct);
    setShowAnswer(true);

    if (answerIndex === questions[currentQuestion].correct) {
      setScore(score + 1);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    setTimeout(() => {
      setShowAnswer(false);
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowQuiz(false);
      }
    }, 2000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (score === questions.length) {
        navigate("/");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [score, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="animate-bounce">
        <BookOpen className="h-20 w-20 mb-6 text-primary" />
      </div>
      <h1 className="text-5xl font-extrabold mb-4">
        404<span className="text-primary">!</span> Chapter Missing
      </h1>
      <p className="text-xl mb-6 text-muted-foreground">
        Oops! You've stumbled into the wrong study room. But don't worry, every mistake is a chance to learn something new!
      </p>
      {!showQuiz ? (
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            variant="default"
            size="lg"
            onClick={() => navigate("/")}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            📚 Back to Dashboard
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowQuiz(true)}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            🧠 Take a Quick Quiz
          </Button>
        </div>
      ) : (
        <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">{questions[currentQuestion].question}</h2>
          <div className="space-y-2">
            {questions[currentQuestion].answers.map((answer, index) => (
              <Button
                key={index}
                variant="outline"
                size="lg"
                className="w-full text-left justify-start"
                onClick={() => handleAnswer(index)}
                disabled={showAnswer}
              >
                <span className="mr-2">{String.fromCharCode(65 + index)}.</span> {answer}
              </Button>
            ))}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </div>
          {showAnswer && (
            <div className={`mt-4 p-2 rounded-md ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isCorrect ? (
                <div className="flex items-center">
                  <Check className="mr-2" />
                  Correct! Well done!
                </div>
              ) : (
                <div className="flex items-center">
                  <X className="mr-2" />
                  Sorry, that's incorrect. The right answer is: {questions[currentQuestion].answers[questions[currentQuestion].correct]}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {score === questions.length && (
        <div className="mt-6 text-xl font-bold animate-pulse text-primary">
          Congratulations! You've mastered the 404 quiz. Redirecting you to safety...
        </div>
      )}
      <div className="mt-12">
        <p className="text-sm text-muted-foreground">Need some help finding your way?</p>
        <div className="flex justify-center items-center gap-2">
          <Search className="h-6 w-6 text-primary animate-spin-slow" />
          <Smile className="h-6 w-6 text-primary animate-spin-slow-reverse" />
        </div>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        .animate-spin-slow-reverse {
          animation: spin-reverse 6s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;

