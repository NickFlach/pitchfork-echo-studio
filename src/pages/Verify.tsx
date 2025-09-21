import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { FileCheck, Upload, Shield, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const Verify = () => {
  const { isConnected } = useWeb3();
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const verifiedDocuments = [
    {
      title: "Gaza Hospital Attack Evidence",
      description: "Medical records and witness testimonies from October 2024",
      verifier: "0x742...d89",
      timestamp: "2024-10-17",
      status: "verified",
      category: "War Crimes"
    },
    {
      title: "Corporate Tax Evasion Report",
      description: "Internal documents showing offshore tax avoidance schemes",
      verifier: "0x891...a23",
      timestamp: "2024-11-22",
      status: "verified",
      category: "Corporate Corruption"
    },
    {
      title: "Police Brutality Footage",
      description: "Body cam footage revealing excessive force incident",
      verifier: "0x456...c78",
      timestamp: "2024-12-03",
      status: "pending",
      category: "Human Rights"
    }
  ];

  const handleSubmitDocument = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      toast({
        title: "Document Submitted",
        description: "Your evidence has been securely uploaded and is being verified.",
      });
    }, 2000);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <FileCheck className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to submit and verify evidence
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-4xl font-bold text-gradient-cosmic">Document Truth</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Securely submit evidence of corruption, war crimes, and injustice. 
            Use blockchain verification to create tamper-proof records that expose the truth.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit Evidence */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Submit Evidence
              </CardTitle>
              <CardDescription>
                Upload documents, images, or videos that expose wrongdoing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Document Title</label>
                <Input placeholder="Brief description of the evidence" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select className="w-full p-2 border border-input bg-background rounded-md">
                  <option value="war-crimes">War Crimes</option>
                  <option value="corporate-corruption">Corporate Corruption</option>
                  <option value="human-rights">Human Rights Violations</option>
                  <option value="environmental">Environmental Crimes</option>
                  <option value="government-corruption">Government Corruption</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  placeholder="Provide context about what this evidence shows..."
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-2">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drop files here or click to upload
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports documents, images, and videos up to 100MB
                </p>
              </div>
              
              <Button 
                onClick={handleSubmitDocument}
                disabled={uploading}
                className="w-full"
                variant="cosmic"
              >
                {uploading ? 'Uploading...' : 'Submit Evidence'}
              </Button>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4" />
                Your identity is protected. Files are encrypted and distributed.
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle>How Verification Works</CardTitle>
              <CardDescription>
                Our process ensures authenticity while protecting sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">1</div>
                  <div>
                    <h4 className="font-semibold">Secure Upload</h4>
                    <p className="text-sm text-muted-foreground">
                      Files are encrypted and stored on decentralized networks
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                  <div>
                    <h4 className="font-semibold">Community Verification</h4>
                    <p className="text-sm text-muted-foreground">
                      Expert verifiers check authenticity using forensic tools
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">3</div>
                  <div>
                    <h4 className="font-semibold">Blockchain Timestamp</h4>
                    <p className="text-sm text-muted-foreground">
                      Verified evidence gets permanent, tamper-proof timestamps
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">4</div>
                  <div>
                    <h4 className="font-semibold">Public Access</h4>
                    <p className="text-sm text-muted-foreground">
                      Verified evidence becomes available for journalists and investigators
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Verified Evidence */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">Recently Verified Evidence</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verifiedDocuments.map((doc, index) => (
              <Card key={index} className="hover:border-primary/40 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <Badge variant={doc.status === 'verified' ? 'default' : 'secondary'}>
                      {doc.status === 'verified' ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {doc.status}
                    </Badge>
                  </div>
                  <CardDescription>{doc.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Badge variant="outline">{doc.category}</Badge>
                    <div className="text-xs text-muted-foreground">
                      Verified by: {doc.verifier}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Date: {doc.timestamp}
                    </div>
                  </div>
                  
                  <Button variant="cosmicOutline" size="sm" className="w-full">
                    View Evidence
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Important Security Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• <strong>Never submit evidence that could endanger lives</strong> - Remove identifying information from sensitive documents</p>
              <p>• <strong>Use secure networks</strong> - Avoid public WiFi when uploading evidence</p>
              <p>• <strong>Verify authenticity</strong> - Only submit evidence you know to be genuine</p>
              <p>• <strong>Legal considerations</strong> - Ensure you have the right to share the evidence</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Verify;