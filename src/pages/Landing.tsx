import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Trophy, 
  Target, 
  Users, 
  Zap, 
  Camera, 
  BarChart3, 
  Award,
  MapPin,
  ArrowRight,
  Play
} from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Hidden{' '}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Athletic Talent
              </span>{' '}
              in Rural India
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              AI-powered sports talent discovery platform that identifies, nurtures, and develops 
              athletes using advanced video analysis and personalized training recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/signup">
                <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                  <Trophy className="w-5 h-5 mr-2" />
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="group">
                <Play className="w-5 h-5 mr-2 group-hover:text-primary transition-colors" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Bridging the Gap in India's Sports Ecosystem
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Rural athletes face significant barriers to recognition and development. 
              Our AI-powered platform democratizes talent discovery and provides scientific coaching.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: MapPin,
                title: "Limited Access",
                description: "Lack of standardized assessment facilities and modern coaching in rural areas"
              },
              {
                icon: BarChart3,
                title: "Poor Tracking",
                description: "Fragmented monitoring systems that don't scale or prevent injuries"
              },
              {
                icon: Users,
                title: "Inequality Gap",
                description: "Socio-economic barriers restricting participation, especially for girls and tribal youth"
              },
              {
                icon: Award,
                title: "Untapped Potential",
                description: "Hidden talent unable to reach full potential due to lack of exposure and guidance"
              }
            ].map((item, index) => (
              <Card key={index} className="text-center hover:shadow-primary transition-all duration-300">
                <CardContent className="p-6">
                  <div className="bg-gradient-primary p-3 rounded-lg w-fit mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-2 text-card-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              AI-Powered Sports Development
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with sports science 
              to provide comprehensive talent assessment and development.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: "Video Analysis",
                description: "Upload training videos and receive AI-powered analysis of technique, speed, and performance metrics.",
                gradient: "bg-gradient-primary"
              },
              {
                icon: Target,
                title: "Personalized Training",
                description: "Get custom 8-week training plans generated by AI based on your strengths and weaknesses.",
                gradient: "bg-gradient-secondary"
              },
              {
                icon: Zap,
                title: "Performance Tracking",
                description: "Monitor progress with scientific metrics, goal tracking, and predictive analytics.",
                gradient: "bg-gradient-performance"
              }
            ].map((feature, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-primary transition-all duration-300">
                <div className={`absolute inset-0 ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
                <CardContent className="p-8 relative">
                  <div className={`${feature.gradient} p-4 rounded-xl w-fit mb-6`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dual Dashboard Preview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Athletes & Coaches
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Role-based dashboards designed specifically for the unique needs of athletes and coaches.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="overflow-hidden group hover:shadow-primary transition-all duration-300">
              <div className="bg-gradient-primary p-1">
                <div className="bg-card p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-primary p-2 rounded-lg mr-3">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">Athlete Dashboard</h3>
                  </div>
                  <ul className="space-y-3 text-muted-foreground">
                    <li>• Upload and analyze training videos</li>
                    <li>• View performance metrics and progress</li>
                    <li>• Access personalized training plans</li>
                    <li>• Track goals and achievements</li>
                    <li>• Receive AI-powered recommendations</li>
                  </ul>
                  <Link to="/auth/signup?role=athlete" className="inline-block mt-6">
                    <Button className="bg-gradient-primary">
                      Join as Athlete
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden group hover:shadow-secondary transition-all duration-300">
              <div className="bg-gradient-secondary p-1">
                <div className="bg-card p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-secondary p-2 rounded-lg mr-3">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">Coach Dashboard</h3>
                  </div>
                  <ul className="space-y-3 text-muted-foreground">
                    <li>• Manage multiple athletes</li>
                    <li>• Generate AI training plans</li>
                    <li>• Monitor athlete progress</li>
                    <li>• Send feedback and messages</li>
                    <li>• Access comprehensive analytics</li>
                  </ul>
                  <Link to="/auth/signup?role=coach" className="inline-block mt-6">
                    <Button className="bg-gradient-secondary">
                      Join as Coach
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Sports in India?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of athletes and coaches who are already using AI to unlock their potential.
          </p>
          <Link to="/auth/signup">
            <Button size="lg" className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
              <Trophy className="w-5 h-5 mr-2" />
              Get Started Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;