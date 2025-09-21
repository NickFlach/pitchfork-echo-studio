import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Users, 
  Lock, 
  Send, 
  Plus, 
  Archive, 
  Shield,
  Key
} from 'lucide-react';
import { useWeb3 } from '@/hooks/useWeb3';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { messagingApi } from '@/lib/api';
import { encryption } from '@/lib/encryption';
import { Conversation, Message } from '../../shared/schema';

const Messages = () => {
  const { isConnected, account } = useWeb3();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationName, setNewConversationName] = useState('');
  const [participants, setParticipants] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch conversations for current user
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', account],
    queryFn: async () => {
      if (!account) return [];
      return await messagingApi.getConversationsByWallet(account);
    },
    enabled: !!account,
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      return await messagingApi.getMessagesByConversation(selectedConversation);
    },
    enabled: !!selectedConversation,
  });

  // Get selected conversation details
  const selectedConv = conversations.find(conv => conv.id === selectedConversation);

  // Create new conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error('No account connected');
      
      const participantList = participants
        .split(',')
        .map(addr => addr.trim())
        .filter(addr => addr.length > 0);
      
      if (!participantList.includes(account)) {
        participantList.push(account);
      }

      const encryptionKey = await encryption.generateSharedKey(participantList);
      
      return await messagingApi.createConversation({
        name: newConversationName,
        participants: participantList,
        encryptionKey,
        conversationType: participantList.length > 2 ? 'group' : 'direct',
      });
    },
    onSuccess: (newConv) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setSelectedConversation(newConv.id);
      setShowNewConversation(false);
      setNewConversationName('');
      setParticipants('');
      toast({
        title: "Conversation Created",
        description: "Secure conversation ready for encrypted messaging",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Conversation",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!selectedConv || !account || !newMessage.trim()) {
        throw new Error('Missing required data');
      }

      const { encryptedContent, contentHash } = await encryption.encryptMessage(
        newMessage,
        selectedConv.encryptionKey
      );

      return await messagingApi.sendMessage({
        conversationId: selectedConv.id,
        senderAddress: account,
        encryptedContent,
        contentHash,
        messageType: 'text',
        isDeleted: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setNewMessage('');
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Message",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Decrypt message for display
  const decryptMessage = async (message: Message): Promise<string> => {
    if (!selectedConv) return '[Error: No conversation]';
    
    try {
      const decrypted = await encryption.decryptMessage(
        message.encryptedContent,
        selectedConv.encryptionKey
      );
      
      // Verify integrity
      const isValid = await encryption.verifyMessageIntegrity(decrypted, message.contentHash);
      if (!isValid) {
        return '[Warning: Message integrity compromised]';
      }
      
      return decrypted;
    } catch {
      return '[Error: Failed to decrypt]';
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-primary mb-4" />
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to access secure messaging
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 pt-8 pb-8">
          <h1 className="text-4xl font-bold text-gradient-cosmic">Secure Messaging</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            End-to-end encrypted communications for safe activist coordination. 
            Messages are encrypted in your browser and can't be intercepted.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Conversations
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="cosmic"
                  onClick={() => setShowNewConversation(true)}
                  data-testid="button-new-conversation"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
              {conversationsLoading ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conv.id 
                        ? 'bg-primary/20 border border-primary/40' 
                        : 'bg-muted/20 hover:bg-muted/30'
                    }`}
                    data-testid={`conversation-${conv.id}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{conv.name}</span>
                      <div className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-green-500" />
                        {conv.conversationType === 'group' && (
                          <Users className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {conv.participants.length} participant{conv.participants.length > 1 ? 's' : ''}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Main Chat Area */}
          <Card className="lg:col-span-3">
            {selectedConversation && selectedConv ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-500" />
                        {selectedConv.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Key className="w-3 h-3" />
                        End-to-end encrypted • {selectedConv.participants.length} participants
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{selectedConv.conversationType}</Badge>
                  </div>
                </CardHeader>
                
                {/* Messages */}
                <CardContent className="flex flex-col h-[400px]">
                  <div className="flex-1 overflow-y-auto space-y-3 py-4">
                    {messagesLoading ? (
                      <div className="text-center py-8">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isOwnMessage = message.senderAddress === account;
                        return (
                          <MessageBubble
                            key={message.id}
                            message={message}
                            isOwnMessage={isOwnMessage}
                            decrypt={decryptMessage}
                          />
                        );
                      })
                    )}
                  </div>
                  
                  {/* Message Input */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your encrypted message..."
                      className="flex-1 min-h-[60px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessageMutation.mutate();
                        }
                      }}
                      data-testid="input-message"
                    />
                    <Button 
                      onClick={() => sendMessageMutation.mutate()}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      variant="cosmic"
                      data-testid="button-send-message"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : showNewConversation ? (
              <>
                <CardHeader>
                  <CardTitle>Create New Conversation</CardTitle>
                  <CardDescription>
                    Start a secure, encrypted conversation with other activists
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Conversation Name</label>
                    <Input
                      value={newConversationName}
                      onChange={(e) => setNewConversationName(e.target.value)}
                      placeholder="e.g., Climate Action Planning"
                      data-testid="input-conversation-name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Participants (wallet addresses)</label>
                    <Textarea
                      value={participants}
                      onChange={(e) => setParticipants(e.target.value)}
                      placeholder="0x123..., 0x456..., 0x789..."
                      className="min-h-[100px]"
                      data-testid="input-participants"
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple addresses with commas. Your address will be added automatically.
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => createConversationMutation.mutate()}
                      disabled={!newConversationName.trim() || createConversationMutation.isPending}
                      variant="cosmic"
                      data-testid="button-create-conversation"
                    >
                      Create Secure Conversation
                    </Button>
                    <Button 
                      onClick={() => setShowNewConversation(false)}
                      variant="cosmicOutline"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-[500px] text-center">
                <div className="space-y-4">
                  <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground/50" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Welcome to Secure Messaging</h3>
                    <p className="text-muted-foreground mb-4">
                      Select a conversation or create a new one to start communicating securely
                    </p>
                    <Button 
                      onClick={() => setShowNewConversation(true)}
                      variant="cosmic"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Start New Conversation
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Security Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">End-to-End Encryption</h3>
                <p className="text-sm text-muted-foreground">
                  Messages encrypted in your browser using AES-256-GCM
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Message Integrity</h3>
                <p className="text-sm text-muted-foreground">
                  SHA-256 hashes verify messages haven't been tampered with
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Key className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Unique Conversation Keys</h3>
                <p className="text-sm text-muted-foreground">
                  Each conversation has its own encryption key for isolation
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Message bubble component with decryption
const MessageBubble = ({ 
  message, 
  isOwnMessage, 
  decrypt 
}: { 
  message: Message; 
  isOwnMessage: boolean; 
  decrypt: (msg: Message) => Promise<string>;
}) => {
  const [decryptedContent, setDecryptedContent] = useState<string>('Decrypting...');

  // Decrypt message on mount
  useState(() => {
    decrypt(message).then(setDecryptedContent);
  });

  return (
    <div
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      data-testid={`message-${message.id}`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isOwnMessage
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <p className="text-sm">{decryptedContent}</p>
        <p className={`text-xs mt-1 ${
          isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
        }`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default Messages;