import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { UserAchievement } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, Trophy, Award, Star, CheckCircle, BookOpen, Target } from "lucide-react";

export default function AchievementsPage() {
  const { user } = useAuth();

  // Fetch user achievements
  const { data: achievements, isLoading } = useQuery<UserAchievement[]>({
    queryKey: ["/api/user/achievements"],
    enabled: !!user,
  });

  // Function to get icon based on achievement type
  const getAchievementIcon = (type: string) => {
    switch (type) {
      case "course_completion":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "quiz_perfect":
        return <Star className="h-5 w-5 text-amber-500" />;
      case "streak":
        return <Target className="h-5 w-5 text-blue-500" />;
      default:
        return <Award className="h-5 w-5 text-purple-500" />;
    }
  };

  // Function to get color scheme based on achievement type
  const getAchievementColors = (type: string) => {
    switch (type) {
      case "course_completion":
        return "bg-green-50 border-green-200";
      case "quiz_perfect":
        return "bg-amber-50 border-amber-200";
      case "streak":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-purple-50 border-purple-200";
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Link href="/courses">
          <Button variant="ghost" size="sm" className="flex items-center text-muted-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Courses
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Trophy className="h-8 w-8 mr-3 text-amber-500" />
            Your Achievements
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your progress and celebrate your financial learning milestones
          </p>
        </div>
      </div>

      {(!achievements || achievements.length === 0) ? (
        <div className="max-w-md mx-auto text-center bg-muted p-8 rounded-lg">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Achievements Yet</h3>
          <p className="text-muted-foreground mb-6">
            Complete courses and quizzes to earn achievements and track your progress.
          </p>
          <Link href="/courses">
            <Button>
              Explore Courses
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <Card 
              key={achievement.id} 
              className={`overflow-hidden border-2 ${getAchievementColors(achievement.type)}`}
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="mr-3 p-2 rounded-full bg-background">
                      {getAchievementIcon(achievement.type)}
                    </div>
                    <CardTitle className="text-lg">{achievement.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{achievement.description}</p>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground border-t pt-3">
                Earned on {format(new Date(achievement.awardedAt), "MMMM d, yyyy")}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Stats section */}
      {achievements && achievements.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Achievement Statistics</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Achievements</CardDescription>
                <CardTitle className="text-3xl">{achievements.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Award className="h-4 w-4 mr-1" />
                  Keep learning to earn more
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Courses Completed</CardDescription>
                <CardTitle className="text-3xl">
                  {achievements.filter(a => a.type === "course_completion").length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4 mr-1" />
                  Building your knowledge
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Perfect Quiz Scores</CardDescription>
                <CardTitle className="text-3xl">
                  {achievements.filter(a => a.type === "quiz_perfect").length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Star className="h-4 w-4 mr-1" />
                  Mastering financial concepts
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}