import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([
    { id: '1', sender: 'Agent', text: 'Dr. Smith, Mary is agitated. Should we play her favorite 60s music?', isAgent: true }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'Dr. Smith', text: input, isAgent: false }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'Agent', text: 'Executing music protocol and dimming the lights.', isAgent: true }]);
    }, 1000);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.header}>Triage Agent Chat</Text>
      <ScrollView contentContainerStyle={styles.chatArea}>
        {messages.map(msg => (
          <View key={msg.id} style={[styles.messageBubble, msg.isAgent ? styles.agentBubble : styles.userBubble]}>
            <Text style={styles.senderName}>{msg.sender}</Text>
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={[styles.inputArea, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TextInput 
          style={styles.input}
          placeholder="Message the agent..."
          placeholderTextColor="#9ca3af"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  chatArea: {
    padding: 20,
  },
  messageBubble: {
    padding: 15,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: '85%',
  },
  agentBubble: {
    backgroundColor: '#374151',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#10b981',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 22,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    backgroundColor: '#111827',
  },
  input: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 15,
  },
  sendBtn: {
    backgroundColor: '#10b981',
    borderRadius: 24,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginLeft: 12,
  },
  sendBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
