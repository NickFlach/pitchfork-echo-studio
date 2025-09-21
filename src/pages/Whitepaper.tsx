import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Whitepaper = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Whitepaper link copied to clipboard!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="sticky top-0 bg-background/80 backdrop-blur-sm border-b border-primary/20 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Platform
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="cosmicOutline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="cosmic" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-cosmic rounded-full flex items-center justify-center glow-cosmic">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-cosmic mb-4">
            Fighting Back Against Greed and Corruption
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            A People's Guide to Digital Resistance
          </p>
          <p className="text-sm text-muted-foreground/80">
            Using decentralized tools for peaceful resistance and justice
          </p>
        </div>

        {/* Whitepaper Content */}
        <div className="prose prose-invert max-w-none">
          <div className="bg-background/10 backdrop-blur-sm border border-primary/20 rounded-xl p-8 space-y-8">
            
            {/* Table of Contents */}
            <div className="bg-muted/10 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gradient-cosmic mb-4">Table of Contents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <a href="#problem" className="text-primary hover:text-primary/80 transition-colors">1. The Problem We Face</a>
                <a href="#traditional-methods" className="text-primary hover:text-primary/80 transition-colors">2. Why Traditional Methods Fail</a>
                <a href="#decentralized-power" className="text-primary hover:text-primary/80 transition-colors">3. The Power of Decentralized Resistance</a>
                <a href="#toolkit" className="text-primary hover:text-primary/80 transition-colors">4. Your Digital Toolkit for Justice</a>
                <a href="#action-guides" className="text-primary hover:text-primary/80 transition-colors">5. Step-by-Step Action Guides</a>
                <a href="#safety" className="text-primary hover:text-primary/80 transition-colors">6. Safety First: Protecting Yourself</a>
                <a href="#success-stories" className="text-primary hover:text-primary/80 transition-colors">7. Real-World Success Stories</a>
                <a href="#getting-started" className="text-primary hover:text-primary/80 transition-colors">8. Getting Started Today</a>
                <a href="#legal" className="text-primary hover:text-primary/80 transition-colors">9. Legal Considerations</a>
                <a href="#movement" className="text-primary hover:text-primary/80 transition-colors">10. Building a Movement</a>
              </div>
            </div>

            {/* Problem Section */}
            <section id="problem">
              <h2 className="text-3xl font-bold text-gradient-cosmic mb-6">The Problem We Face</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">The Corruption Crisis</h3>
                  <p className="text-muted-foreground mb-4">We live in an age where:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong className="text-foreground">Corporate greed</strong> drives environmental destruction and worker exploitation</li>
                    <li><strong className="text-foreground">Government corruption</strong> serves special interests over public welfare</li>
                    <li><strong className="text-foreground">War crimes</strong> happen while perpetrators escape accountability</li>
                    <li><strong className="text-foreground">Human rights violations</strong> are covered up by those in power</li>
                    <li><strong className="text-foreground">Truth is suppressed</strong> by those who profit from lies</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Why Regular People Feel Powerless</h3>
                  <p className="text-muted-foreground mb-4">Traditional systems have failed us:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong className="text-foreground">Media censorship</strong> silences whistleblowers</li>
                    <li><strong className="text-foreground">Legal systems</strong> favor the wealthy and connected</li>
                    <li><strong className="text-foreground">Social platforms</strong> can delete evidence overnight</li>
                    <li><strong className="text-foreground">Government agencies</strong> are captured by the industries they regulate</li>
                    <li><strong className="text-foreground">Peaceful protests</strong> are ignored or criminalized</li>
                  </ul>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-6">
                    <p className="text-foreground font-semibold text-center">
                      You are not powerless. Technology has given us new tools to fight back.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Traditional Methods Section */}
            <section id="traditional-methods">
              <h2 className="text-3xl font-bold text-gradient-cosmic mb-6">Why Traditional Methods Fail</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">The Centralization Problem</h3>
                  <p className="text-muted-foreground mb-4">When power is concentrated, it can be:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong className="text-foreground">Corrupted</strong> by special interests</li>
                    <li><strong className="text-foreground">Censored</strong> by those who control the platforms</li>
                    <li><strong className="text-foreground">Shut down</strong> by governments or corporations</li>
                    <li><strong className="text-foreground">Manipulated</strong> to serve the powerful instead of the people</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Examples of System Failures</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong className="text-foreground">Whistleblower suppression</strong>: Truth-tellers face prosecution while criminals walk free</li>
                    <li><strong className="text-foreground">Evidence destruction</strong>: Documents "disappear" and witnesses are silenced</li>
                    <li><strong className="text-foreground">Media blackouts</strong>: Important stories never see the light of day</li>
                    <li><strong className="text-foreground">Legal intimidation</strong>: Expensive lawsuits silence those seeking justice</li>
                    <li><strong className="text-foreground">Platform censorship</strong>: Social media companies remove content that threatens powerful interests</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Decentralized Power Section */}
            <section id="decentralized-power">
              <h2 className="text-3xl font-bold text-gradient-cosmic mb-6">The Power of Decentralized Resistance</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">What "Decentralized" Means</h3>
                  <p className="text-muted-foreground mb-4">Instead of relying on one company, government, or institution, decentralized systems:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong className="text-foreground">Spread power</strong> across many participants</li>
                    <li><strong className="text-foreground">Cannot be easily shut down</strong> because there's no central point of failure</li>
                    <li><strong className="text-foreground">Resist censorship</strong> because no single entity controls the network</li>
                    <li><strong className="text-foreground">Preserve evidence</strong> permanently on blockchain technology</li>
                    <li><strong className="text-foreground">Enable global coordination</strong> without borders or permissions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Why This Matters for Justice</h3>
                  <p className="text-muted-foreground mb-4">When you use decentralized tools:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong className="text-foreground">Your evidence is permanent</strong> - it can't be deleted or "lost"</li>
                    <li><strong className="text-foreground">Your communications are private</strong> - they can't be intercepted or monitored</li>
                    <li><strong className="text-foreground">Your organizing is protected</strong> - groups can't be easily disbanded</li>
                    <li><strong className="text-foreground">Your funding is direct</strong> - money goes straight to causes without intermediaries</li>
                    <li><strong className="text-foreground">Your voice can't be silenced</strong> - no single authority can censor you</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Call to Action */}
            <div className="bg-gradient-cosmic p-8 rounded-xl text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Fight Back?</h3>
              <p className="text-white/90 mb-6">Join the movement and start using decentralized tools for justice today.</p>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/')}
                className="bg-white text-primary hover:bg-white/90"
              >
                Access the Platform
              </Button>
            </div>

            {/* Note about full content */}
            <div className="text-center p-6 bg-muted/10 rounded-lg">
              <p className="text-muted-foreground">
                This is a preview of the whitepaper. The full document contains detailed action guides, 
                safety protocols, real-world case studies, and comprehensive instructions for building 
                effective resistance movements.
              </p>
              <Button variant="cosmic" className="mt-4">
                <Download className="w-4 h-4 mr-2" />
                Download Complete Whitepaper
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whitepaper;