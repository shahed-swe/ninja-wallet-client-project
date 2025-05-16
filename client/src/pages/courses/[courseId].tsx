import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Course, Lesson, UserCourseProgress } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle, ChevronLeft, Lock, ArrowRight, Bookmark, PlayCircle, FileText, HelpCircle, AlertTriangle } from "lucide-react";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = parseInt(params.courseId);
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [activeLesson, setActiveLesson] = useState<number | null>(null);

  // Fetch course details
  const { data: course, isLoading: isLoadingCourse } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !isNaN(courseId),
  });

  // Fetch course lessons
  const { data: lessons, isLoading: isLoadingLessons } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${courseId}/lessons`],
    enabled: !isNaN(courseId),
  });

  // Fetch user's progress for this course if authenticated
  const { data: userProgress, isLoading: isLoadingProgress } = useQuery<UserCourseProgress>({
    queryKey: [`/api/user/progress`, courseId],
    queryFn: async () => {
      const allProgress = await queryClient.fetchQuery({
        queryKey: ["/api/user/progress"],
      });
      return allProgress.find((p: any) => p.courseId === courseId);
    },
    enabled: !!user && !isNaN(courseId),
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (data: any) => {
      // If progress exists, update it
      if (userProgress) {
        return await apiRequest("POST", `/api/courses/${courseId}/progress`, data);
      }
      // Otherwise create new progress record
      return await apiRequest("POST", `/api/courses/${courseId}/progress`, {
        ...data,
        lastCompletedLessonId: null,
        isCompleted: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
    },
  });

  // Complete lesson and check if course is completed
  const completeLesson = async (lessonId: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to track your progress.",
        variant: "destructive",
      });
      return;
    }

    // Get the completed lessons array or initialize if none
    const completedLessons = userProgress?.completedLessons || [];
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    }

    // Calculate progress percentage
    const progress = lessons ? (completedLessons.length / lessons.length) * 100 : 0;
    const isCompleted = progress === 100;

    // Get the last completed lesson
    const lastCompletedLessonId = lessonId;

    // Update progress
    await updateProgressMutation.mutateAsync({
      completedLessons,
      progress,
      isCompleted,
      lastCompletedLessonId,
    });

    // Award achievement if course is completed
    if (isCompleted && course) {
      try {
        await apiRequest("POST", "/api/user/achievements", {
          type: "course_completion",
          name: `Completed: ${course.title}`,
          description: `Successfully completed the ${course.title} course`,
          metadata: {
            courseId: course.id,
            courseTitle: course.title,
            completedAt: new Date().toISOString(),
          },
        });

        toast({
          title: "Achievement Unlocked!",
          description: `You've earned an achievement for completing ${course.title}`,
        });
      } catch (error) {
        console.error("Error awarding achievement:", error);
      }
    }

    toast({
      title: "Progress Saved",
      description: isCompleted 
        ? "Congratulations! You've completed this course." 
        : "Your progress has been saved."
    });

    // If course is completed, navigate to the achievement page
    if (isCompleted) {
      setTimeout(() => {
        navigate("/courses/achievements");
      }, 1500);
    }
  };

  // Select a lesson to display
  useEffect(() => {
    if (lessons && lessons.length > 0) {
      // If user has progress, start from their last completed lesson + 1 or from beginning
      if (userProgress?.lastCompletedLessonId) {
        const lastCompletedIndex = lessons.findIndex(l => l.id === userProgress.lastCompletedLessonId);
        const nextLessonId = lessons[Math.min(lastCompletedIndex + 1, lessons.length - 1)]?.id;
        setActiveLesson(nextLessonId);
      } else {
        // Otherwise start from the first lesson
        setActiveLesson(lessons[0].id);
      }
    }
  }, [lessons, userProgress]);

  // Get the active lesson object
  const currentLesson = lessons?.find(lesson => lesson.id === activeLesson);

  // Check if a lesson is completed by the user
  const isLessonCompleted = (lessonId: number) => {
    if (!userProgress?.completedLessons) return false;
    return userProgress.completedLessons.includes(lessonId);
  };

  // If the course is premium but user is not premium, show upgrade message
  const isPremiumBlocked = course?.isPremium && !user?.isPremium;

  // Loading state
  if (isLoadingCourse || isLoadingLessons || (!!user && isLoadingProgress)) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Error state: Course not found
  if (!course || !lessons) {
    return (
      <div className="container py-8">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist or has been removed.</p>
          <Link href="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Course header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link href="/courses">
            <Button variant="ghost" size="sm" className="flex items-center text-muted-foreground">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Courses
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className={
                course.difficulty.toLowerCase() === "beginner" ? "bg-green-100 text-green-800" :
                course.difficulty.toLowerCase() === "intermediate" ? "bg-blue-100 text-blue-800" :
                "bg-purple-100 text-purple-800"
              }>
                {course.difficulty}
              </Badge>
              {course.isPremium && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  Premium
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-3 max-w-3xl">{course.description}</p>
          </div>

          {userProgress && (
            <div className="bg-muted p-4 rounded-lg w-full md:w-64 flex-shrink-0">
              <h3 className="font-medium mb-2">Your Progress</h3>
              <Progress value={userProgress.progress} className="h-2 mb-2" />
              <p className="text-sm text-muted-foreground">
                {Math.round(userProgress.progress)}% Complete
              </p>
              <div className="text-sm mt-2">
                <span className="font-medium">{userProgress.completedLessons?.length || 0}</span> of <span className="font-medium">{lessons.length}</span> lessons completed
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Premium content block */}
      {isPremiumBlocked && (
        <Alert className="mb-8 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-800">Premium Content</AlertTitle>
          <AlertDescription className="text-amber-700">
            This course requires a premium subscription. Upgrade your account to access all premium educational content.
          </AlertDescription>
          <div className="mt-4">
            <Link href="/subscribe">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                Upgrade to Premium
              </Button>
            </Link>
          </div>
        </Alert>
      )}

      {/* Course content */}
      {!isPremiumBlocked && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Lesson list sidebar */}
          <div className="md:col-span-1">
            <div className="bg-card rounded-lg border shadow-sm">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Course Content</h2>
                <p className="text-sm text-muted-foreground mt-1">{lessons.length} Lessons</p>
              </div>
              <div className="divide-y">
                {lessons.map((lesson, index) => {
                  const isCompleted = isLessonCompleted(lesson.id);
                  const isActive = lesson.id === activeLesson;
                  
                  return (
                    <div 
                      key={lesson.id}
                      className={`p-3 cursor-pointer transition-colors ${isActive ? 'bg-muted' : 'hover:bg-muted/50'}`}
                      onClick={() => setActiveLesson(lesson.id)}
                    >
                      <div className="flex items-start">
                        <div className={`flex items-center justify-center h-6 w-6 rounded-full mr-3 mt-0.5 flex-shrink-0 ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-xs">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <h3 className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {lesson.title}
                          </h3>
                          <div className="flex items-center mt-1">
                            {lesson.type === 'video' && (
                              <span className="text-xs flex items-center text-muted-foreground">
                                <PlayCircle className="h-3 w-3 mr-1" />
                                Video
                              </span>
                            )}
                            {lesson.type === 'text' && (
                              <span className="text-xs flex items-center text-muted-foreground">
                                <FileText className="h-3 w-3 mr-1" />
                                Article
                              </span>
                            )}
                            {lesson.type === 'quiz' && (
                              <span className="text-xs flex items-center text-muted-foreground">
                                <HelpCircle className="h-3 w-3 mr-1" />
                                Quiz
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Lesson content area */}
          <div className="md:col-span-2 lg:col-span-3">
            {currentLesson ? (
              <Card className="shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">
                        Lesson {lessons.findIndex(l => l.id === currentLesson.id) + 1} of {lessons.length}
                      </div>
                      <CardTitle>{currentLesson.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {currentLesson.type === 'video' && (
                        <>
                          <PlayCircle className="h-3 w-3 mr-1" />
                          Video
                        </>
                      )}
                      {currentLesson.type === 'text' && (
                        <>
                          <FileText className="h-3 w-3 mr-1" />
                          Article
                        </>
                      )}
                      {currentLesson.type === 'quiz' && (
                        <>
                          <HelpCircle className="h-3 w-3 mr-1" />
                          Quiz
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Video content */}
                  {currentLesson.type === 'video' && currentLesson.videoUrl && (
                    <div className="mb-6">
                      <div className="aspect-video bg-muted rounded-md overflow-hidden">
                        <iframe 
                          src={currentLesson.videoUrl} 
                          title={currentLesson.title} 
                          className="w-full h-full"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                  )}
                  
                  {/* Lesson content */}
                  <div className="prose max-w-none">
                    {/* Render content as HTML */}
                    <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                  </div>

                  {/* Quiz content */}
                  {currentLesson.type === 'quiz' && currentLesson.quizData && (
                    <div className="mt-6 border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">Knowledge Check</h3>
                      <QuizComponent 
                        quizData={currentLesson.quizData} 
                        onComplete={() => completeLesson(currentLesson.id)} 
                      />
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-between border-t pt-6">
                  {/* Navigation buttons */}
                  <div className="flex items-center space-x-2">
                    {isLessonCompleted(currentLesson.id) ? (
                      <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    ) : (
                      <Button onClick={() => completeLesson(currentLesson.id)}>
                        Mark as Completed
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Previous lesson button */}
                    {lessons.findIndex(l => l.id === currentLesson.id) > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
                          if (currentIndex > 0) {
                            setActiveLesson(lessons[currentIndex - 1].id);
                          }
                        }}
                      >
                        Previous Lesson
                      </Button>
                    )}
                    
                    {/* Next lesson button */}
                    {lessons.findIndex(l => l.id === currentLesson.id) < lessons.length - 1 && (
                      <Button
                        onClick={() => {
                          const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
                          if (currentIndex < lessons.length - 1) {
                            setActiveLesson(lessons[currentIndex + 1].id);
                          }
                        }}
                        className="flex items-center"
                      >
                        Next Lesson
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ) : (
              <div className="bg-muted rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Select a lesson from the sidebar to begin learning.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Authentication reminder for non-logged in users */}
      {!user && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
          <div className="flex items-start">
            <Bookmark className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Sign in to track your progress</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your progress won't be saved until you sign in. Create an account or sign in to continue learning.
              </p>
              <div className="mt-3">
                <Link href="/auth">
                  <Button size="sm" variant="outline">
                    Sign In / Register
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Quiz Component
function QuizComponent({ quizData, onComplete }: { quizData: any, onComplete: () => void }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const questions = quizData.questions || [];
  const currentQuizQuestion = questions[currentQuestion];

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: answerIndex });
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question: any, index: number) => {
      if (selectedAnswers[index] === question.correctAnswerIndex) {
        correctAnswers++;
      }
    });
    const finalScore = (correctAnswers / questions.length) * 100;
    setScore(finalScore);

    // Award achievement for perfect score
    if (finalScore === 100) {
      try {
        apiRequest("POST", "/api/user/achievements", {
          type: "quiz_perfect",
          name: "Perfect Quiz Score",
          description: "Achieved a perfect score on a financial knowledge quiz",
          metadata: {
            quizId: quizData.id,
            quizTitle: quizData.title,
            score: finalScore,
            completedAt: new Date().toISOString(),
          },
        });

        toast({
          title: "Achievement Unlocked!",
          description: "You've earned an achievement for getting a perfect quiz score!",
        });
      } catch (error) {
        console.error("Error awarding achievement:", error);
      }
    }

    // Call onComplete to mark the lesson as completed
    onComplete();
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  // If no quiz data is available
  if (!currentQuizQuestion) {
    return <div>No quiz questions available.</div>;
  }

  // Results screen
  if (showResults) {
    const passingScore = 70;
    const passed = score >= passingScore;

    return (
      <div className="bg-muted/30 rounded-lg p-6">
        <h3 className="text-xl font-medium mb-4 text-center">
          Quiz Results
        </h3>
        
        <div className="flex justify-center mb-6">
          <div className={`h-32 w-32 rounded-full flex items-center justify-center ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
            <span className={`text-3xl font-bold ${passed ? 'text-green-700' : 'text-red-700'}`}>
              {Math.round(score)}%
            </span>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <h4 className={`font-medium ${passed ? 'text-green-700' : 'text-red-700'}`}>
            {passed ? 'Congratulations! You passed the quiz.' : 'You did not pass the quiz.'}
          </h4>
          <p className="text-muted-foreground mt-1">
            {passed ? 'You demonstrated a good understanding of this topic.' : `The passing score is ${passingScore}%. Review the material and try again.`}
          </p>
        </div>
        
        <div className="flex justify-center space-x-3">
          <Button variant="outline" onClick={resetQuiz}>
            Retry Quiz
          </Button>
        </div>
      </div>
    );
  }

  // Quiz question display
  return (
    <div className="bg-muted/30 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium">
          Question {currentQuestion + 1} of {questions.length}
        </h4>
        <span className="text-sm text-muted-foreground">
          {currentQuestion + 1} / {questions.length}
        </span>
      </div>
      
      <h3 className="text-lg mb-4">{currentQuizQuestion.question}</h3>
      
      <div className="space-y-3 mb-6">
        {currentQuizQuestion.answers.map((answer: string, index: number) => (
          <div 
            key={index}
            className={`p-3 border rounded-md cursor-pointer transition-colors ${
              selectedAnswers[currentQuestion] === index 
                ? 'bg-primary/10 border-primary' 
                : 'hover:bg-muted'
            }`}
            onClick={() => handleAnswerSelect(currentQuestion, index)}
          >
            <div className="flex items-center">
              <div className={`h-5 w-5 rounded-full border flex items-center justify-center mr-3 ${
                selectedAnswers[currentQuestion] === index 
                  ? 'border-primary bg-primary text-primary-foreground' 
                  : 'border-muted-foreground'
              }`}>
                {selectedAnswers[currentQuestion] === index && (
                  <div className="h-2.5 w-2.5 rounded-full bg-background" />
                )}
              </div>
              <span>{answer}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={goToNextQuestion}
          disabled={selectedAnswers[currentQuestion] === undefined}
        >
          {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Button>
      </div>
    </div>
  );
}