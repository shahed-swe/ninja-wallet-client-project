import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ChevronLeft, Lock, CheckCircle, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface Course {
  id: number;
  title: string;
  description: string;
  level: string;
  isPublished: boolean;
  isPremium: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  id: number;
  courseId: number;
  title: string;
  content: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CourseProgress {
  id: number;
  userId: number;
  courseId: number;
  completedLessons: number;
  isCompleted: boolean;
  lastAccessedAt: string;
}

export default function CourseDetailPage() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [, params] = useRoute("/courses/:id");
  const courseId = params?.id ? parseInt(params.id) : 0;
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${courseId}`],
    enabled: !!courseId,
  });

  // Fetch lessons for this course
  const { data: lessons, isLoading: lessonsLoading } = useQuery<Lesson[]>({
    queryKey: [`/api/courses/${courseId}/lessons`],
    enabled: !!courseId,
  });

  // Fetch user's progress for this course if authenticated
  const { data: progress, isLoading: progressLoading } = useQuery<CourseProgress>({
    queryKey: [`/api/user/progress`],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user/progress");
      const allProgress = await res.json();
      const courseProgress = allProgress.find((p: CourseProgress) => p.courseId === courseId);
      return courseProgress || null;
    },
    enabled: isAuthenticated && !!courseId,
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (data: { completedLessons: number; isCompleted: boolean }) => {
      const res = await apiRequest("POST", `/api/courses/${courseId}/progress`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
    },
  });

  // Award achievement mutation
  const awardAchievementMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; type: string; courseId: number }) => {
      const res = await apiRequest("POST", `/api/user/achievements`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/achievements"] });
    },
  });

  // Mark lesson as completed
  const markLessonCompleted = async (lessonId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to track your progress",
        variant: "destructive",
      });
      return;
    }

    // Find the current lesson
    const currentLesson = lessons?.find((l) => l.id === lessonId);
    if (!currentLesson) return;

    // Calculate new completed lessons count
    let completedLessonsCount = progress?.completedLessons || 0;
    if (!progress || completedLessonsCount < currentLesson.order) {
      completedLessonsCount = currentLesson.order;
    }

    // Check if this completes the course
    const isCourseDone = completedLessonsCount === lessons?.length;

    // Update progress
    await updateProgressMutation.mutateAsync({
      completedLessons: completedLessonsCount,
      isCompleted: isCourseDone,
    });

    // Award achievement if course is completed
    if (isCourseDone && course) {
      try {
        await awardAchievementMutation.mutateAsync({
          name: `Completed: ${course.title}`,
          description: `Successfully completed the ${course.title} course`,
          type: "course_completion",
          courseId: course.id,
        });

        toast({
          title: "Achievement Unlocked!",
          description: `Congratulations! You've completed the ${course.title} course.`,
        });
      } catch (error) {
        console.error("Error awarding achievement:", error);
      }
    } else {
      toast({
        title: "Progress Saved",
        description: "Your course progress has been updated",
      });
    }
  };

  // Check if a lesson is locked (premium content for non-premium users)
  const isLessonLocked = (lesson: Lesson) => {
    if (!course) return true;
    
    // If the course is premium and user is not premium, lock all lessons
    if (course.isPremium && !user?.isPremium) return true;
    
    // If not authenticated, only free previews (first lesson) are available
    if (!isAuthenticated && lesson.order > 1) return true;
    
    return false;
  };

  // Get the first lesson or the current one in progress
  const getInitialLessonToShow = () => {
    if (!lessons || lessons.length === 0) return null;
    
    // If user has progress, show the next lesson they need to complete
    if (progress && lessons) {
      // Find the next lesson based on progress
      const nextLessonOrder = progress.completedLessons + 1;
      const nextLesson = lessons.find(l => l.order === nextLessonOrder);
      
      // If there's a next lesson, show it, otherwise show the first lesson
      return nextLesson?.id || lessons[0].id;
    }
    
    // Default to first lesson
    return lessons[0].id;
  };

  // Initialize the selected lesson once data is loaded
  if (!selectedLessonId && lessons && lessons.length > 0 && !lessonsLoading) {
    setSelectedLessonId(getInitialLessonToShow());
  }

  const selectedLesson = lessons?.find(lesson => lesson.id === selectedLessonId);

  if (courseLoading || lessonsLoading) {
    return <CourseDetailLoading />;
  }

  if (!course) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
        <p className="text-muted-foreground mb-8">The course you're looking for doesn't exist or has been removed.</p>
        <Button asChild>
          <Link href="/courses">Back to Courses</Link>
        </Button>
      </div>
    );
  }

  // Check if course is locked for the current user
  const isCourseLocked = course.isPremium && !user?.isPremium;

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Link href="/courses" className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Courses
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar with course info and lessons */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="mb-1">{course.title}</CardTitle>
                  <Badge variant={course.level === "beginner" ? "default" : course.level === "intermediate" ? "secondary" : "destructive"}>
                    {course.level === "beginner" ? "Beginner" : course.level === "intermediate" ? "Intermediate" : "Advanced"}
                  </Badge>
                </div>
                {course.isPremium && (
                  <Badge variant="outline" className="border-amber-500 text-amber-500">
                    Premium
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">{course.description}</CardDescription>
              
              {/* Progress bar for authenticated users */}
              {progress && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Your Progress</span>
                    <span>
                      {progress.isCompleted 
                        ? "Completed" 
                        : `${progress.completedLessons}/${lessons?.length || 0} lessons`}
                    </span>
                  </div>
                  <Progress 
                    value={progress.isCompleted ? 100 : (progress.completedLessons / (lessons?.length || 1)) * 100} 
                    className="h-2" 
                  />
                </div>
              )}

              {/* Premium upgrade prompt */}
              {isCourseLocked && (
                <div className="bg-muted p-4 rounded-lg mb-6 flex flex-col items-center text-center">
                  <Lock className="h-8 w-8 text-muted-foreground mb-2" />
                  <h3 className="font-medium mb-1">Premium Content</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Upgrade to Premium to access this course and all premium content.
                  </p>
                  <Button asChild size="sm">
                    <Link href="/subscribe">Upgrade Now</Link>
                  </Button>
                </div>
              )}

              <Separator className="my-4" />
              
              {/* Lesson list */}
              <div className="space-y-1 mt-4">
                <h3 className="font-medium mb-3">Course Lessons</h3>
                {lessons?.map((lesson) => {
                  const isLocked = isLessonLocked(lesson);
                  const isCompleted = progress && progress.completedLessons >= lesson.order;
                  const isActive = selectedLessonId === lesson.id;
                  
                  return (
                    <Button
                      key={lesson.id}
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start ${isLocked ? 'opacity-50' : ''} ${isCompleted ? 'text-green-600' : ''}`}
                      onClick={() => !isLocked && setSelectedLessonId(lesson.id)}
                      disabled={isLocked}
                    >
                      <div className="flex items-center w-full">
                        <div className="mr-2">
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </div>
                        <span className="text-sm">{lesson.title}</span>
                        {isLocked && <Lock className="h-3 w-3 ml-auto" />}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-2">
          {selectedLesson ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedLesson.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLessonLocked(selectedLesson) ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    <Lock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-medium mb-2">Premium Content Locked</h2>
                    <p className="text-muted-foreground max-w-md mb-6">
                      This lesson is part of our premium content. Upgrade to unlock all premium 
                      courses and accelerate your financial education.
                    </p>
                    <Button asChild>
                      <Link href="/subscribe">Upgrade to Premium</Link>
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="prose max-w-none dark:prose-invert">
                      {selectedLesson.content.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                    
                    {isAuthenticated && (
                      <div className="mt-8 flex justify-end">
                        <Button 
                          onClick={() => markLessonCompleted(selectedLesson.id)}
                          disabled={progress && progress.completedLessons >= selectedLesson.order}
                        >
                          {progress && progress.completedLessons >= selectedLesson.order ? (
                            <>Completed <CheckCircle className="ml-2 h-4 w-4" /></>
                          ) : (
                            "Mark as Complete"
                          )}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full p-16 bg-muted rounded-lg">
              <div className="text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-medium mb-2">No Lesson Selected</h2>
                <p className="text-muted-foreground">
                  Select a lesson from the sidebar to start learning
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Loading skeleton component
function CourseDetailLoading() {
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar loading state */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-4/6 mb-6" />
              
              <Skeleton className="h-2 w-full mb-6" />
              <Separator className="my-4" />
              
              <Skeleton className="h-6 w-32 mb-4" />
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-10 w-full mb-1" />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main content loading state */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-5/6 mb-3" />
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-4/5 mb-3" />
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-full mb-3" />
              <Skeleton className="h-4 w-2/3 mb-6" />
              <div className="flex justify-end">
                <Skeleton className="h-10 w-36" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
