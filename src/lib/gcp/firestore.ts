import { db } from './firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

export interface Message {
  id?: string;
  role: string;
  text: string;
  createdAt?: any;
  source?: string;
  actions?: string[];
  author?: string;
  isTranslation?: boolean;
}

export function subscribeToAgentMessages(callback: (messages: Message[]) => void) {
  const q = query(collection(db, 'agent_messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    callback(messages);
  });
}

export async function sendAgentMessage(msg: Partial<Message>) {
  await addDoc(collection(db, 'agent_messages'), {
    ...msg,
    createdAt: serverTimestamp()
  });
}

export function subscribeToFamilyMessages(callback: (messages: Message[]) => void) {
  const q = query(collection(db, 'family_messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
    callback(messages);
  });
}

export async function sendFamilyMessage(msg: Partial<Message>) {
  await addDoc(collection(db, 'family_messages'), {
    ...msg,
    createdAt: serverTimestamp()
  });
}
