/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp
} from 'firebase/firestore';
import { useAuthState, useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import './global.css';
import { app, databaseApp } from './services/firebaseConfig';

const auth = getAuth(app);

export const App = () => {
  const [user] = useAuthState(auth);
  const [showClearButton, setShowClearButton] = useState(false);

  const handleSignOut = () => {
    // Limpar a conversa
    // eslint-disable-next-line no-undef
    messagesRef.get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        doc.ref.delete();
      });
    });

    // Fazer logout
    auth.signOut();
  };

  useEffect(() => {
    setShowClearButton(!!user);
  }, [user]);

  return (
    <div className='App'>
      <header>
        <h1>Welcome to Chatbot</h1>
        <SignOut onSignOut={handleSignOut} />
      </header>
      <section>
        {user ? <ChatRoom showClearButton={showClearButton} /> : <SignIn />}
      </section>
    </div>
  );
};

export const ChatRoom = ({ showClearButton }) => {
  const dummy = useRef();
  const messagesRef = collection(databaseApp, 'messages');
  const q = query(messagesRef, orderBy('createdAt'), limit(25));
  const [messages] = useCollectionData(q, { idField: 'id' });

  const [formValue, setFormValue] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const sendMessage = async e => {
    e.preventDefault();
    const { photoURL, uid } = auth.currentUser;

    await addDoc(messagesRef, {
      text: formValue,
      uid,
      photoURL,
      createdAt: serverTimestamp()
    });
    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });

    // Verificar mensagem enviada e gerar resposta automática
    if (formValue.toLowerCase().includes('olá')) {
      if (!username) {
        await addDoc(messagesRef, {
          text: 'Olá! Por favor, informe seu nome de usuário.',
          uid: 'bot',
          createdAt: serverTimestamp()
        });
      } else if (!password) {
        await addDoc(messagesRef, {
          text: `Olá, ${username}! Por favor, informe sua senha.`,
          uid: 'bot',
          createdAt: serverTimestamp()
        });
      } else {
        await addDoc(messagesRef, {
          text: `Olá, ${username}! Como posso ajudar você?`,
          uid: 'bot',
          createdAt: serverTimestamp()
        });
      }
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    } else if (formValue.toLowerCase().includes('adeus')) {
      await addDoc(messagesRef, {
        text: 'Até logo! Volte sempre.',
        uid: 'bot',
        createdAt: serverTimestamp()
      });
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    } else if (formValue.toLowerCase().includes('bom')) {
      await addDoc(messagesRef, {
        text: 'Bom dia! Como posso ser útil hoje?',
        uid: 'bot',
        createdAt: serverTimestamp()
      });
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    } else if (formValue.toLowerCase().includes('quero')) {
      if (!username || !password) {
        await addDoc(messagesRef, {
          text: 'Antes de prosseguir, por favor, informe seu nome de usuário e senha.',
          uid: 'bot',
          createdAt: serverTimestamp()
        });
      } else {
        await addDoc(messagesRef, {
          text: 'O que você deseja?',
          uid: 'bot',
          createdAt: serverTimestamp()
        });
      }
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    } else if (formValue.toLowerCase().includes('empréstimo')) {
      await addDoc(messagesRef, {
        text: 'Opções de empréstimo:\n1. Solicitar um empréstimo\n2. Condições de empréstimo\n3. Ajuda',
        uid: 'bot',
        createdAt: serverTimestamp()
      });
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const clearConversation = async () => {
    const querySnapshot = await getDocs(messagesRef);
    querySnapshot.forEach(doc => {
      deleteDoc(doc.ref);
    });
  };

  return (
    <>
      <main>
        {messages &&
          messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
        <div ref={dummy}></div>
      </main>
      <form onSubmit={sendMessage}>
        <div className='form-container'>
          <input
            type='text'
            value={formValue}
            onChange={e => setFormValue(e.target.value)}
          />
          <div className='button-container'>
            <button type='submit' disabled={!formValue}>
              Enviar
            </button>
            {showClearButton && (
              <button className='clear-button' onClick={clearConversation}>
                Limpar
              </button>
            )}
          </div>
        </div>
      </form>
      {!username && (
        <div>
          {/* <label>Nome de usuário:</label> */}
          <input
            type='text'
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
      )}
      {username && !password && (
        <div>
          <label>Senha:</label>
          <input
            type='password'
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
      )}
    </>
  );
};

export const ChatMessage = props => {
  // eslint-disable-next-line react/prop-types
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img
        src={
          photoURL ||
          'https://cdn.dribbble.com/users/79449/screenshots/14019420/bot_4x.png'
        }
        alt='Bot'
      />
      <p>{text}</p>
    </div>
  );
};

export const SignIn = () => {
  const [signInWithGoogle] = useSignInWithGoogle(auth);

  return (
    <button className='sign-in' onClick={signInWithGoogle}>
      Fazer Login com o Google
    </button>
  );
};

export const SignOut = ({ onSignOut }) => {
  return (
    auth.currentUser && (
      <button className='sign-out' onClick={onSignOut}>
        Sair
      </button>
    )
  );
};
