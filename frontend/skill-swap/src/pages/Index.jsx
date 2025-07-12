import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui-consolidated";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui-consolidated";
import { Badge } from "@/components/ui-consolidated";
import { Input } from "@/components/ui-consolidated";
import { Label } from "@/components/ui-consolidated";
import { Separator } from "@/components/ui-consolidated";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui-consolidated';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui-consolidated';
import { Star, Users, Award, Zap, Search, MessageCircle, Shield, TrendingUp, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Social Icons Component
const SocialIcons = ({ onSocialLogin }) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => onSocialLogin('Google')}
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => onSocialLogin('Facebook')}
      >
        <svg className="w-4 h-4 mr-2" fill="#1877F2" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Facebook
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => onSocialLogin('GitHub')}
      >
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        GitHub
      </Button>
    </div>
  );
};

// Auth Modal Component
const AuthModal = ({ children, mode = 'login' }) => {
  const [open, setOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState(mode);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onLoginSubmit = async (data) => {
    try {
      const success = await login(data.email, data.password);
      if (success) {
        toast.success('Welcome back to SkillSwap!');
        setOpen(false);
        navigate('/social');
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  const onRegisterSubmit = async (data) => {
    try {
      const success = await register(data.email, data.password, data.name);
      if (success) {
        toast.success('Welcome to SkillSwap! Your account has been created.');
        setOpen(false);
        navigate('/social');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  const handleSocialLogin = (provider) => {
    toast.success(`${provider} login will be available soon!`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Welcome to SkillSwap</DialogTitle>
          <DialogDescription className="text-center">
            Join the world's largest skill exchange community
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Welcome back! Enter your credentials to continue.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="john@example.com"
                      {...loginForm.register('email')}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {loginForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      {...loginForm.register('password')}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {loginForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full">
                    Sign In
                  </Button>
                </form>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <p className="text-sm text-center text-muted-foreground">
                    Or continue with
                  </p>
                  <SocialIcons onSocialLogin={handleSocialLogin} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>
                  Join thousands of learners and teachers worldwide.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Full Name</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="John Doe"
                      {...registerForm.register('name')}
                    />
                    {registerForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="john@example.com"
                      {...registerForm.register('email')}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="Create a password"
                      {...registerForm.register('password')}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm-password">Confirm Password</Label>
                    <Input
                      id="register-confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      {...registerForm.register('confirmPassword')}
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {registerForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>
                </form>

                <Separator className="my-4" />

                <div className="space-y-3">
                  <p className="text-sm text-center text-muted-foreground">
                    Or continue with
                  </p>
                  <SocialIcons onSocialLogin={handleSocialLogin} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/social');
    }
  }, [user, navigate]);

  const featuredSkills = [
    "React Development", "UI/UX Design", "Python Programming", "Digital Marketing",
    "Photography", "Language Exchange", "Guitar Lessons", "Data Science"
  ];

  const stats = [
    { label: "Active Users", value: "10,000+", icon: Users },
    { label: "Skills Exchanged", value: "50,000+", icon: Award },
    { label: "Success Rate", value: "95%", icon: TrendingUp },
    { label: "Trust Score", value: "4.9/5", icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">SkillSwap</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-foreground/80 hover:text-foreground transition-colors">How it Works</a>
            <a href="#community" className="text-foreground/80 hover:text-foreground transition-colors">Community</a>
          </nav>
          <div className="flex items-center space-x-3">
            <AuthModal mode="login">
              <Button variant="ghost">Sign In</Button>
            </AuthModal>
            <AuthModal mode="register">
              <Button>Get Started</Button>
            </AuthModal>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <Badge variant="secondary" className="mb-4">🚀 Revolutionizing Peer-to-Peer Learning</Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Exchange Skills,<br />Transform Lives
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of learners who share knowledge, build connections, and grow together in our trusted skill-exchange community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <AuthModal mode="register">
              <Button size="lg" className="text-lg px-8">
                Start Learning Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </AuthModal>
            <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => navigate('/discovery')}>
              <Search className="w-5 h-5 mr-2" />
              Browse Skills
            </Button>
          </div>
          
          {/* Featured Skills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {featuredSkills.map((skill) => (
              <Badge key={skill} variant="outline" className="px-3 py-1">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose SkillSwap?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with community-driven features to create the ultimate learning experience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Credit Banking System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Earn credits by teaching skills and spend them to learn new ones. No money exchanged, just pure knowledge sharing.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  AI-Powered Matching
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our smart algorithms connect you with the perfect learning partners based on skills, location, and availability.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Trust & Safety
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Verified profiles, peer endorsements, and comprehensive rating system ensure safe and quality exchanges.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Real-time Communication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Built-in messaging, video calls, and scheduling tools make coordinating skill sessions seamless.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Gamified Learning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Unlock achievements, climb leaderboards, and showcase your expertise with badges and certifications.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Global Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect with learners worldwide, share on social media, and build lasting professional relationships.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Learning Journey?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join our community of passionate learners and start exchanging skills today. It's free, it's fun, and it's transformative.
          </p>
          <AuthModal mode="register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Join SkillSwap Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </AuthModal>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">SkillSwap</span>
          </div>
          <p>&copy; 2024 SkillSwap. Empowering learners worldwide.</p>
        </div>
      </footer>

    </div>
  );
};

export default Index;