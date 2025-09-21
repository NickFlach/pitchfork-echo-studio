import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share2, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

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

  const generatePdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    }) as any; // Temporary type assertion to fix type issues

    // Add metadata
    const title = "Fighting Back Against Greed and Corruption";
    const subtitle = "A People's Guide to Digital Resistance";
    const date = format(new Date(), 'MMMM d, yyyy');
    
    // Set document properties
    doc.setProperties({
      title: title,
      subject: 'A guide to digital resistance using decentralized tools',
      author: 'Pitchfork Echo Studio',
      keywords: 'activism, digital resistance, decentralization, corruption',
      creator: 'Pitchfork Echo Studio',
    });

    // Add title page
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 105, 100, { align: 'center', maxWidth: 180 });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, 105, 120, { align: 'center', maxWidth: 180 });
    
    doc.setFontSize(12);
    doc.text(`Version 1.0 • ${date}`, 105, 200, { align: 'center' });
    
    doc.addPage();
    
    // Table of Contents
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Table of Contents', 20, 30);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    const sections = [
      { title: 'The Problem We Face', page: 3 },
      { title: 'The Power of Decentralized Resistance', page: 4 },
      { title: 'Key Technologies for Digital Resistance', page: 5 },
      { title: 'Building Your Digital Resistance Toolkit', page: 8 },
      { title: 'Taking Action: A Step-by-Step Guide', page: 12 },
      { title: 'Staying Safe and Secure', page: 16 },
      { title: 'Real-World Examples', page: 18 },
      { title: 'Join the Movement', page: 20 },
    ];
    
    sections.forEach((section, index) => {
      doc.text(section.title, 25, 50 + (index * 10));
      doc.text('... ' + section.page, 180, 50 + (index * 10), { align: 'right' });
    });
    
    // Add main content
    doc.addPage();
    
    // Function to add section with proper formatting
    const addSection = (title: string, content: string[], isSubsection = false) => {
      const startY = doc.getNumberOfPages() > 3 ? 20 : 30;
      
      doc.setFont('helvetica', isSubsection ? 'bold' : 'bold');
      doc.setFontSize(isSubsection ? 14 : 16);
      
      const splitTitle = doc.splitTextToSize(title, 170);
      const titleHeight = splitTitle.length * 7;
      
      // Check if we need a new page
      if (doc.internal.pageSize.height - (doc as any).lastAutoTable.finalY < 40 + titleHeight) {
        doc.addPage();
      }
      
      doc.text(title, 20, startY);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      
      let y = startY + 10;
      
      content.forEach(paragraph => {
        const lines = doc.splitTextToSize(paragraph, 170);
        doc.text(lines, 20, y);
        y += lines.length * 7;
        
        // Add some space between paragraphs
        y += 5;
        
        // Check if we need a new page
        if (y > doc.internal.pageSize.height - 20) {
          doc.addPage();
          y = 20;
        }
      });
      
      // Add some space after section
      y += 10;
      
      // Update finalY for autoTable
      (doc as any).lastAutoTable.finalY = y;
    };
    
    // Add header and footer to each page
    // Note: We're using a type assertion here to access internal properties
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Header
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Pitchfork Echo Studio", 20, 10);
      doc.text(`Page ${i} of ${pageCount}`, 180, 10, { align: 'right' } as any);
      
      // Footer
      doc.text("Confidential - For educational purposes only", 105, 285, { align: 'center' } as any);
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
    }
    
    // Save the PDF
    doc.save('Fighting_Back_Whitepaper.pdf');
  };

  const handleDownload = (downloadFormat: 'pdf' | 'text' = 'text') => {
    if (downloadFormat === 'pdf') {
      generatePdf();
      toast({
        title: "PDF Generated",
        description: "Your whitepaper PDF is being downloaded.",
      });
      return;
    }
    
    // Fallback to text download
    const whitepaperContent = `# Fighting Back Against Greed and Corruption: A People's Guide to Digital Resistance

*A White Paper for Regular Citizens Using Decentralized Tools*

---

## The Problem We Face

### The Corruption Crisis

We live in an age where:
- **Corporate greed** drives environmental destruction and worker exploitation
- **Government corruption** serves special interests over public welfare
- **War crimes** happen while perpetrators escape accountability
- **Human rights violations** are covered up by those in power
- **Truth is suppressed** by those who profit from lies

### Why Regular People Feel Powerless

Traditional systems have failed us:
- **Media censorship** silences whistleblowers
- **Legal systems** favor the wealthy and connected
- **Social platforms** can delete evidence overnight
- **Government agencies** are captured by the industries they regulate
- **Peaceful protests** are ignored or criminalized

**You are not powerless.** Technology has given us new tools to fight back.

---

## The Power of Decentralized Resistance

### What "Decentralized" Means

Instead of relying on one company, government, or institution, decentralized systems:
- **Spread power** across many participants
- **Cannot be easily shut down** because there's no central point of failure
- **Resist censorship** because no single entity controls the network
- **Preserve evidence** permanently on blockchain technology
- **Enable global coordination** without borders or permissions

### Why This Matters for Justice

When you use decentralized tools:
- **Your evidence is permanent** - it can't be deleted or "lost"
- **Your communications are private** - they can't be intercepted or monitored
- **Your organizing is protected** - groups can't be easily disbanded
- **Your funding is direct** - money goes straight to causes without intermediaries
- **Your voice can't be silenced** - no single authority can censor you

---

## Your Digital Toolkit for Justice

The Pitchfork Protocol provides six essential tools for peaceful resistance:

### 🛡️ **Secure Identity**
- **What it does**: Verifies who you are without revealing personal information
- **Why you need it**: Prevents impersonation and builds trust while protecting privacy
- **Real example**: Whistleblowers can prove their credibility without exposing themselves

### 👥 **Organize**
- **What it does**: Coordinates resistance movements and activist groups
- **Why you need it**: Enables large-scale coordination without central leadership
- **Real example**: Environmental activists organizing cleanup efforts across multiple cities

### 💬 **Secure Messages**
- **What it does**: Provides encrypted communication that can't be monitored
- **Why you need it**: Protects sensitive discussions from surveillance
- **Real example**: Journalists coordinating with sources in dangerous situations

### ⚖️ **DAO Governance**
- **What it does**: Enables democratic voting on important decisions
- **Why you need it**: Ensures movements remain truly grassroots and democratic
- **Real example**: Community groups voting on how to allocate resources

### 📋 **Verify**
- **What it does**: Documents and verifies evidence of corruption
- **Why you need it**: Creates tamper-proof records that can't be "lost" or altered
- **Real example**: Recording environmental damage or documenting human rights abuses

### ❤️ **Support**
- **What it does**: Funds justice movements and campaigns
- **Why you need it**: Enables direct financial support without intermediaries taking cuts
- **Real example**: Crowdfunding legal defense for wrongfully accused activists

---

## Getting Started Today

### Your First 30 Minutes

#### Step 1: Set Up Your Digital Wallet (5 minutes)
1. Download a Web3 wallet like MetaMask
2. Create a new wallet and **securely save your recovery phrase**
3. Never share your recovery phrase with anyone

#### Step 2: Connect to Pitchfork Protocol (2 minutes)
1. Visit the Pitchfork Protocol application
2. Click "Connect Wallet"
3. Approve the connection in your wallet

#### Step 3: Create Your Secure Identity (10 minutes)
1. Navigate to "Secure Identity"
2. Choose your verification level (start with "basic" for privacy)
3. Complete the verification process
4. Your identity is now cryptographically secured

#### Step 4: Explore the Tools (13 minutes)
- Spend 2-3 minutes exploring each tool
- Read the descriptions and understand the capabilities
- Don't feel pressured to use everything immediately

---

## Safety First: Protecting Yourself

### Digital Security

#### Wallet Security
- **Never share your private keys or recovery phrase**
- Use hardware wallets for large amounts
- Keep your wallet software updated
- Use strong, unique passwords

#### Communication Security
- Always use the encrypted messaging within the platform
- Don't discuss sensitive matters on regular social media
- Be aware that metadata can reveal patterns
- Use VPNs when possible for additional privacy

### The Choice Before Us

We stand at a crossroads. We can:

**Accept the status quo:**
- Allow corruption to continue unchecked
- Let the powerful silence the truth
- Watch injustice triumph over justice
- Leave a broken world for our children

**Or we can fight back:**
- Use technology to expose corruption
- Build networks of resistance
- Create accountability where none existed
- Build a better world together

---

**The pitchforks are digital now. The revolution will be decentralized.**

---

*This white paper is a living document. Share it freely, adapt it to your local context, and most importantly—use it to fight back.*

---

For the complete whitepaper with detailed action guides, safety protocols, real-world case studies, and comprehensive instructions, visit: ${window.location.origin}/whitepaper
`;

    const filename = downloadFormat === 'pdf' ? 'Fighting_Back_Whitepaper.pdf' : 'Fighting_Back_Whitepaper.txt';
    const mimeType = downloadFormat === 'pdf' ? 'application/pdf' : 'text/plain';
    
    if (downloadFormat === 'pdf') {
      toast({
        title: "PDF Generated",
        description: "Your whitepaper PDF is being downloaded.",
        variant: "default",
      });
      return;
    }
    
    const blob = new Blob([whitepaperContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: `Whitepaper download started successfully.`,
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
            <Button variant="cosmic" size="sm" onClick={() => handleDownload('pdf')}>
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <Button 
                  variant="cosmic" 
                  onClick={() => handleDownload('pdf')}
                  className="flex-1 sm:flex-none min-w-[200px]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF Version
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleDownload('text')}
                  className="flex-1 sm:flex-none min-w-[200px]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Text Version
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whitepaper;