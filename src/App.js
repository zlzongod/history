import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight, Edit2, BookOpen, LogOut, Home, FolderPlus, Folder, RotateCcw, Book, FileText } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, where, addDoc, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export default function IntegratedEnglishApp() {
  const [user, setUser] = useState(null);
  const [appMode, setAppMode] = useState('login'); // 'login', 'selectApp', 'vocabulary', 'sentence'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (appMode === 'login') {
          setAppMode('selectApp');
        }
      } else {
        setUser(null);
        setAppMode('login');
      }
    });
    return unsubscribe;
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google 로그인 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setAppMode('login');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  if (appMode === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-2xl p-12 max-w-md w-full">
          <BookOpen size={64} className="text-gray-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">영어 학습 앱</h1>
          <p className="text-gray-600 text-center mb-8">단어장과 문장 연습으로 영어 실력을 향상시키세요</p>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 로그인
          </button>
        </div>
      </div>
    );
  }

  if (appMode === 'selectApp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">학습 모드 선택</h1>
              <p className="text-gray-600">{user?.displayName}님, 환영합니다!</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <LogOut size={20} /> 로그아웃
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button
              onClick={() => setAppMode('vocabulary')}
              className="bg-white rounded-lg shadow-xl p-12 hover:shadow-2xl transition transform hover:scale-105"
            >
              <Book size={64} className="text-gray-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">단어장</h2>
              <p className="text-gray-600 text-lg">단어와 예문을 등록하고 암기 모드로 학습하세요</p>
            </button>
            
            <button
              onClick={() => setAppMode('sentence')}
              className="bg-white rounded-lg shadow-xl p-12 hover:shadow-2xl transition transform hover:scale-105"
            >
              <FileText size={64} className="text-gray-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-4">문장 연습</h2>
              <p className="text-gray-600 text-lg">문장을 등록하고 배열 및 입력 연습을 하세요</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (appMode === 'vocabulary') {
    return <VocabularyApp user={user} onBack={() => setAppMode('selectApp')} onLogout={handleLogout} />;
  }

  if (appMode === 'sentence') {
    return <SentenceApp user={user} onBack={() => setAppMode('selectApp')} onLogout={handleLogout} />;
  }
}

// 단어장 앱 컴포넌트
function VocabularyApp({ user, onBack, onLogout }) {
  const [vocabFolders, setVocabFolders] = useState([]);
  const [selectedVocabFolder, setSelectedVocabFolder] = useState(null);
  const [vocabularyData, setVocabularyData] = useState([]);
  const [hiddenStates, setHiddenStates] = useState({});
  const [studyMode, setStudyMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [newVocabFolderName, setNewVocabFolderName] = useState('');
  const [showNewVocabFolderInput, setShowNewVocabFolderInput] = useState(false);
  const [vocabFeedback, setVocabFeedback] = useState('');
  const [vocabMode, setVocabMode] = useState('folderSelect'); // 'folderSelect', 'main'
  const entriesPerPage = 10;

  const entries = vocabularyData.map(d => ({
    ...d,
    hiddenWord: hiddenStates[d.id]?.hiddenWord ?? false,
    hiddenExample: hiddenStates[d.id]?.hiddenExample ?? false,
    hiddenMeaning: hiddenStates[d.id]?.hiddenMeaning ?? false
  }));

  const totalPages = Math.ceil(entries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentEntries = entries.slice(startIndex, endIndex);

  useEffect(() => {
    if (user) {
      loadVocabFolders();
    }
  }, [user]);

  useEffect(() => {
    if (!selectedVocabFolder || !user) return;
    const collectionPath = `users/${user.uid}/vocabFolders/${selectedVocabFolder.id}/vocabulary`;
    const q = query(collection(db, collectionPath), orderBy('createdAt'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setVocabularyData(data);
      setLoaded(true);
    });
    return unsub;
  }, [selectedVocabFolder, user]);

  useEffect(() => {
    if (loaded && vocabularyData.length === 0 && selectedVocabFolder) {
      addVocabEntry();
    }
  }, [loaded, vocabularyData.length, selectedVocabFolder]);

  const loadVocabFolders = async () => {
    try {
      const q = query(collection(db, 'vocabFolders'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const foldersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVocabFolders(foldersList);
    } catch (error) {
      console.error('폴더 로드 실패:', error);
    }
  };

  const createVocabFolder = async () => {
    if (!newVocabFolderName.trim()) {
      setVocabFeedback('폴더 이름을 입력하세요.');
      setTimeout(() => setVocabFeedback(''), 2000);
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'vocabFolders'), {
        userId: user.uid,
        name: newVocabFolderName,
        createdAt: new Date()
      });
      const newFolder = {
        id: docRef.id,
        userId: user.uid,
        name: newVocabFolderName
      };
      setVocabFolders([...vocabFolders, newFolder]);
      setNewVocabFolderName('');
      setShowNewVocabFolderInput(false);
      setVocabFeedback('폴더가 생성되었습니다!');
      setTimeout(() => setVocabFeedback(''), 2000);
    } catch (error) {
      console.error('폴더 생성 실패:', error);
      setVocabFeedback('폴더 생성에 실패했습니다.');
      setTimeout(() => setVocabFeedback(''), 2000);
    }
  };

  const selectVocabFolder = (folder) => {
    setSelectedVocabFolder(folder);
    setVocabMode('main');
    setLoaded(false);
    setVocabularyData([]);
  };

  const deleteVocabFolder = async (folderId) => {
    if (!window.confirm('이 폴더를 삭제하시겠습니까? 폴더 내의 모든 단어도 함께 삭제됩니다.')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'vocabFolders', folderId));
      const collectionPath = `users/${user.uid}/vocabFolders/${folderId}/vocabulary`;
      const q = query(collection(db, collectionPath));
      const querySnapshot = await getDocs(q);
      for (const vocabDoc of querySnapshot.docs) {
        await deleteDoc(vocabDoc.ref);
      }
      setVocabFolders(vocabFolders.filter(f => f.id !== folderId));
      setVocabFeedback('폴더가 삭제되었습니다!');
      setTimeout(() => setVocabFeedback(''), 2000);
    } catch (error) {
      console.error('폴더 삭제 실패:', error);
      setVocabFeedback('폴더 삭제에 실패했습니다.');
      setTimeout(() => setVocabFeedback(''), 2000);
    }
  };

  const addVocabEntry = async () => {
    if (!selectedVocabFolder) return;
    const collectionPath = `users/${user.uid}/vocabFolders/${selectedVocabFolder.id}/vocabulary`;
    const newDocRef = doc(collection(db, collectionPath));
    const newId = newDocRef.id;

    setVocabularyData([...vocabularyData, { id: newId, word: '', example: '', meaning: '' }]);

    const newLength = vocabularyData.length + 1;
    const newPage = Math.ceil(newLength / entriesPerPage);
    setCurrentPage(newPage);

    setTimeout(() => {
      document.getElementById(`word-${newId}`)?.focus();
    }, 0);

    await setDoc(newDocRef, {
      word: '',
      example: '',
      meaning: '',
      createdAt: serverTimestamp()
    });
  };

  const deleteVocabEntry = async (id) => {
    if (entries.length > 1) {
      setVocabularyData(vocabularyData.filter((d) => d.id !== id));
      setHiddenStates((prev) => {
        const newHidden = { ...prev };
        delete newHidden[id];
        return newHidden;
      });

      const newLength = vocabularyData.length - 1;
      const newTotalPages = Math.ceil(newLength / entriesPerPage);
      if (currentPage > newTotalPages) {
        setCurrentPage(Math.max(1, newTotalPages));
      }

      const collectionPath = `users/${user.uid}/vocabFolders/${selectedVocabFolder.id}/vocabulary`;
      await deleteDoc(doc(db, collectionPath, id));
    }
  };

  const updateVocabEntry = async (id, field, value) => {
    setVocabularyData(vocabularyData.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
    const collectionPath = `users/${user.uid}/vocabFolders/${selectedVocabFolder.id}/vocabulary`;
    await updateDoc(doc(db, collectionPath, id), { [field]: value });
  };

  const handleVocabKeyDown = async (e, entryId, currentField) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const currentIndex = vocabularyData.findIndex((d) => d.id === entryId);

      if (currentField === 'word') {
        document.getElementById(`example-${entryId}`)?.focus();
      } else if (currentField === 'example') {
        document.getElementById(`meaning-${entryId}`)?.focus();
      } else if (currentField === 'meaning') {
        if (currentIndex === vocabularyData.length - 1) {
          const collectionPath = `users/${user.uid}/vocabFolders/${selectedVocabFolder.id}/vocabulary`;
          const newDocRef = doc(collection(db, collectionPath));
          const newId = newDocRef.id;

          setVocabularyData([...vocabularyData, { id: newId, word: '', example: '', meaning: '' }]);

          const nextIndex = vocabularyData.length;
          const nextPage = Math.ceil((nextIndex + 1) / entriesPerPage);
          setCurrentPage(nextPage);

          setTimeout(() => {
            document.getElementById(`word-${newId}`)?.focus();
          }, 0);

          await setDoc(newDocRef, {
            word: '',
            example: '',
            meaning: '',
            createdAt: serverTimestamp()
          });
        } else {
          const nextEntry = vocabularyData[currentIndex + 1];
          const nextEntryIndex = currentIndex + 1;
          const nextEntryPage = Math.ceil((nextEntryIndex + 1) / entriesPerPage);

          if (nextEntryPage !== currentPage) {
            setCurrentPage(nextEntryPage);
            setTimeout(() => {
              document.getElementById(`word-${nextEntry.id}`)?.focus();
            }, 0);
          } else {
            document.getElementById(`word-${nextEntry.id}`)?.focus();
          }
        }
      }
    }
  };

  const toggleHidden = (id, field) => {
    setHiddenStates((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || { hiddenWord: false, hiddenExample: false, hiddenMeaning: false }),
        [field]: !(prev[id]?.[field] ?? false)
      }
    }));
  };

  const hideAllWords = () => {
    const allHidden = currentEntries.every((entry) => entry.hiddenWord);
    const newHidden = {};
    currentEntries.forEach((entry) => {
      newHidden[entry.id] = {
        ...(hiddenStates[entry.id] || { hiddenWord: false, hiddenExample: false, hiddenMeaning: false }),
        hiddenWord: !allHidden
      };
    });
    setHiddenStates((prev) => ({ ...prev, ...newHidden }));
  };

  const hideAllExamples = () => {
    const allHidden = currentEntries.every((entry) => entry.hiddenExample);
    const newHidden = {};
    currentEntries.forEach((entry) => {
      newHidden[entry.id] = {
        ...(hiddenStates[entry.id] || { hiddenWord: false, hiddenExample: false, hiddenMeaning: false }),
        hiddenExample: !allHidden
      };
    });
    setHiddenStates((prev) => ({ ...prev, ...newHidden }));
  };

  const hideAllMeanings = () => {
    const allHidden = currentEntries.every((entry) => entry.hiddenMeaning);
    const newHidden = {};
    currentEntries.forEach((entry) => {
      newHidden[entry.id] = {
        ...(hiddenStates[entry.id] || { hiddenWord: false, hiddenExample: false, hiddenMeaning: false }),
        hiddenMeaning: !allHidden
      };
    });
    setHiddenStates((prev) => ({ ...prev, ...newHidden }));
  };

  const showAll = () => {
    const newHidden = {};
    currentEntries.forEach((entry) => {
      newHidden[entry.id] = {
        hiddenWord: false,
        hiddenExample: false,
        hiddenMeaning: false
      };
    });
    setHiddenStates((prev) => ({ ...prev, ...newHidden }));
  };

  const handlePageInputChange = (e) => {
    setPageInput(e.target.value);
  };

  const handlePageInputSubmit = () => {
    const pageNum = parseInt(pageInput);
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setPageInput('');
    } else {
      alert(`1부터 ${totalPages} 사이의 페이지 번호를 입력해주세요.`);
    }
  };

  const handlePageInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handlePageInputSubmit();
    }
  };

  const renderPageButtons = () => {
    const MAX_VISIBLE_PAGES = 9;
    const buttons = [];

    if (totalPages <= MAX_VISIBLE_PAGES) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
              currentPage === i
                ? 'bg-gray-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      const half = Math.floor(MAX_VISIBLE_PAGES / 2);
      let startPage, endPage;

      if (currentPage <= half + 1) {
        startPage = 1;
        endPage = MAX_VISIBLE_PAGES;
      } else if (currentPage >= totalPages - half) {
        startPage = totalPages - MAX_VISIBLE_PAGES + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - half;
        endPage = currentPage + half;
      }

      if (startPage > 1) {
        buttons.push(
          <button
            key={1}
            onClick={() => setCurrentPage(1)}
            className="w-10 h-10 rounded-lg font-semibold transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            1
          </button>
        );
        if (startPage > 2) {
          buttons.push(
            <span key="dots1" className="text-gray-500 px-1">...</span>
          );
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
              currentPage === i
                ? 'bg-gray-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {i}
          </button>
        );
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          buttons.push(
            <span key="dots2" className="text-gray-500 px-1">...</span>
          );
        }
        buttons.push(
          <button
            key={totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="w-10 h-10 rounded-lg font-semibold transition-colors bg-gray-200 text-gray-700 hover:bg-gray-300"
          >
            {totalPages}
          </button>
        );
      }
    }

    return buttons;
  };

  if (vocabMode === 'folderSelect') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">단어장 폴더 선택</h1>
              <p className="text-gray-600">{user?.displayName}님</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <Home size={20} /> 메인
              </button>
              <button
                onClick={onLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <LogOut size={20} /> 로그아웃
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {vocabFolders.map(folder => (
              <div
                key={folder.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <button
                    onClick={() => selectVocabFolder(folder)}
                    className="flex-1 text-left hover:opacity-80 transition"
                  >
                    <Folder size={48} className="text-gray-500 mb-2" />
                    <h3 className="text-xl font-bold text-gray-800">{folder.name}</h3>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteVocabFolder(folder.id);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 flex-shrink-0"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {!showNewVocabFolderInput ? (
            <button
              onClick={() => setShowNewVocabFolderInput(true)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <FolderPlus size={20} /> 새 폴더 생성
            </button>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newVocabFolderName}
                  onChange={(e) => setNewVocabFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createVocabFolder()}
                  placeholder="폴더 이름을 입력하세요..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  autoFocus
                />
                <button
                  onClick={createVocabFolder}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  생성
                </button>
                <button
                  onClick={() => setShowNewVocabFolderInput(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  취소
                </button>
              </div>
              {vocabFeedback && <p className="mt-3 text-sm font-medium px-3 py-2 rounded-lg bg-gray-100 text-gray-700">{vocabFeedback}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">나의 단어장</h1>
              <p className="text-gray-600">{selectedVocabFolder?.name}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setVocabMode('folderSelect')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <Folder size={20} /> 폴더
              </button>
              <button
                onClick={onBack}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <Home size={20} /> 메인
              </button>
              <button
                onClick={() => setStudyMode(!studyMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  studyMode 
                    ? 'bg-gray-600 text-white hover:bg-gray-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {studyMode ? <Eye size={20} /> : <EyeOff size={20} />}
                {studyMode ? '편집 모드' : '암기 모드'}
              </button>
              {!studyMode && (
                <button
                  onClick={addVocabEntry}
                  className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Plus size={20} />
                  단어 추가
                </button>
              )}
            </div>
          </div>

          {/* Pagination top */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-gray-200">
            <div className="text-gray-600 font-medium">
              페이지 {currentPage} / {totalPages} (총 {entries.length}개의 단어)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                <ChevronLeft size={18} />
                이전
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
              >
                다음
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Study mode controls */}
          {studyMode && (
            <div className="flex gap-2 mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
              <button
                onClick={hideAllWords}
                className="flex-1 bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors text-sm font-semibold shadow-md"
              >
                {currentEntries.every(e => e.hiddenWord) ? '단어 모두 보기' : '단어 모두 가리기'}
              </button>
              <button
                onClick={hideAllExamples}
                className="flex-1 bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors text-sm font-semibold shadow-md"
              >
                {currentEntries.every(e => e.hiddenExample) ? '예문 모두 보기' : '예문 모두 가리기'}
              </button>
              <button
                onClick={hideAllMeanings}
                className="flex-1 bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors text-sm font-semibold shadow-md"
              >
                {currentEntries.every(e => e.hiddenMeaning) ? '뜻 모두 보기' : '뜻 모두 가리기'}
              </button>
              <button
                onClick={showAll}
                className="flex-1 bg-gray-500 text-white px-4 py-3 rounded-lg hover:bg-gray-600 transition-colors text-sm font-semibold shadow-md"
              >
                전체 초기화
              </button>
            </div>
          )}

          <div className="space-y-4">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 pb-3 border-b-2 border-gray-300 font-semibold text-gray-700">
              <div className="col-span-3">단어</div>
              <div className="col-span-5">예문</div>
              <div className="col-span-3">뜻</div>
              {!studyMode && <div className="col-span-1"></div>}
            </div>

            {/* Entries */}
            {currentEntries.map((entry) => (
              <div 
                key={entry.id} 
                className="grid grid-cols-12 gap-4 items-start pb-4 border-b border-gray-200 hover:bg-gray-50 transition-colors p-3 rounded"
              >
                {/* Word */}
                <div className="col-span-3 relative">
                  {!studyMode ? (
                    <textarea
                      id={`word-${entry.id}`}
                      value={entry.word}
                      onChange={(e) => updateVocabEntry(entry.id, 'word', e.target.value)}
                      onKeyDown={(e) => handleVocabKeyDown(e, entry.id, 'word')}
                      placeholder="단어 입력"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                      rows="2"
                    />
                  ) : (
                    <div
                      onClick={() => toggleHidden(entry.id, 'hiddenWord')}
                      className={`w-full p-2 border border-gray-300 rounded min-h-[60px] cursor-pointer flex items-center justify-center ${
                        entry.hiddenWord 
                          ? 'bg-gray-800 text-white text-sm font-semibold' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {entry.hiddenWord ? '클릭하여 보기' : (entry.word || '내용 없음')}
                    </div>
                  )}
                </div>

                {/* Example */}
                <div className="col-span-5 relative">
                  {!studyMode ? (
                    <textarea
                      id={`example-${entry.id}`}
                      value={entry.example}
                      onChange={(e) => updateVocabEntry(entry.id, 'example', e.target.value)}
                      onKeyDown={(e) => handleVocabKeyDown(e, entry.id, 'example')}
                      placeholder="예문 입력"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                      rows="2"
                    />
                  ) : (
                    <div
                      onClick={() => toggleHidden(entry.id, 'hiddenExample')}
                      className={`w-full p-2 border border-gray-300 rounded min-h-[60px] cursor-pointer flex items-center justify-center ${
                        entry.hiddenExample 
                          ? 'bg-gray-800 text-white text-sm font-semibold' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {entry.hiddenExample ? '클릭하여 보기' : (entry.example || '내용 없음')}
                    </div>
                  )}
                </div>

                {/* Meaning */}
                <div className="col-span-3 relative">
                  {!studyMode ? (
                    <textarea
                      id={`meaning-${entry.id}`}
                      value={entry.meaning}
                      onChange={(e) => updateVocabEntry(entry.id, 'meaning', e.target.value)}
                      onKeyDown={(e) => handleVocabKeyDown(e, entry.id, 'meaning')}
                      placeholder="뜻 입력"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
                      rows="2"
                    />
                  ) : (
                    <div
                      onClick={() => toggleHidden(entry.id, 'hiddenMeaning')}
                      className={`w-full p-2 border border-gray-300 rounded min-h-[60px] cursor-pointer flex items-center justify-center ${
                        entry.hiddenMeaning 
                          ? 'bg-gray-800 text-white text-sm font-semibold' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {entry.hiddenMeaning ? '클릭하여 보기' : (entry.meaning || '내용 없음')}
                    </div>
                  )}
                </div>

                {/* Delete button */}
                {!studyMode && (
                  <div className="col-span-1 flex items-center justify-center">
                    <button
                      onClick={() => deleteVocabEntry(entry.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors"
                      disabled={entries.length === 1}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination bottom */}
          <div className="mt-6 pt-4 border-t-2 border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-4">
              {renderPageButtons()}
            </div>
            
            {/* Page input */}
            <div className="flex items-center justify-center gap-2">
              <label className="text-gray-600 font-medium">페이지 이동:</label>
              <input
                type="number"
                value={pageInput}
                onChange={handlePageInputChange}
                onKeyDown={handlePageInputKeyDown}
                placeholder="번호 입력"
                min="1"
                max={totalPages}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-center"
              />
              <button
                onClick={handlePageInputSubmit}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                이동
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 문장 연습 앱 컴포넌트
function SentenceApp({ user, onBack, onLogout }) {
  const [sentenceFolders, setSentenceFolders] = useState([]);
  const [selectedSentenceFolder, setSelectedSentenceFolder] = useState(null);
  const [sentences, setSentences] = useState([]);
  const [newSentence, setNewSentence] = useState('');
  const [koreanTranslation, setKoreanTranslation] = useState('');
  const [sentenceMode, setSentenceMode] = useState('folderSelect');
  const [feedback, setFeedback] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingSentence, setEditingSentence] = useState('');
  const [editingKorean, setEditingKorean] = useState('');
  const [newSentenceFolderName, setNewSentenceFolderName] = useState('');
  const [showNewSentenceFolderInput, setShowNewSentenceFolderInput] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [randomizedSentences, setRandomizedSentences] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [quizFeedback, setQuizFeedback] = useState('');
  const [failedSentences, setFailedSentences] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [practiceMode, setPracticeMode] = useState(null);
  const [draggedWord, setDraggedWord] = useState(null);
  const [draggedFromIndex, setDraggedFromIndex] = useState(null);
  const [wordOpacity, setWordOpacity] = useState({});

  useEffect(() => {
    if (user) {
      loadSentenceFolders();
    }
  }, [user]);

  const loadSentenceFolders = async () => {
    try {
      const q = query(collection(db, 'folders'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const foldersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSentenceFolders(foldersList);
    } catch (error) {
      console.error('폴더 로드 실패:', error);
    }
  };

  const createSentenceFolder = async () => {
    if (!newSentenceFolderName.trim()) {
      setFeedback('폴더 이름을 입력하세요.');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'folders'), {
        userId: user.uid,
        name: newSentenceFolderName,
        createdAt: new Date()
      });
      const newFolder = {
        id: docRef.id,
        userId: user.uid,
        name: newSentenceFolderName,
        sentences: []
      };
      setSentenceFolders([...sentenceFolders, newFolder]);
      setNewSentenceFolderName('');
      setShowNewSentenceFolderInput(false);
      setFeedback('폴더가 생성되었습니다!');
      setTimeout(() => setFeedback(''), 2000);
    } catch (error) {
      console.error('폴더 생성 실패:', error);
      setFeedback('폴더 생성에 실패했습니다.');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const selectSentenceFolder = async (folder) => {
    setSelectedSentenceFolder(folder);
    try {
      let sentencesList;
      if (folder.id === 'all') {
        const q = query(collection(db, 'sentences'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        sentencesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } else {
        const q = query(collection(db, 'sentences'), where('folderId', '==', folder.id));
        const querySnapshot = await getDocs(q);
        sentencesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      }
      setSentences(sentencesList);
    } catch (error) {
      console.error('문장 로드 실패:', error);
      setSentences([]);
    }
    setSentenceMode('main');
  };

  const deleteSentenceFolder = async (folderId) => {
    if (!window.confirm('이 폴더를 삭제하시겠습니까? 폴더 내의 모든 문장도 함께 삭제됩니다.')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'folders', folderId));
      const q = query(collection(db, 'sentences'), where('folderId', '==', folderId));
      const querySnapshot = await getDocs(q);
      for (const sentenceDoc of querySnapshot.docs) {
        await deleteDoc(sentenceDoc.ref);
      }
      const newFolders = sentenceFolders.filter(f => f.id !== folderId);
      setSentenceFolders(newFolders);
      setFeedback('폴더가 삭제되었습니다!');
      setTimeout(() => setFeedback(''), 2000);
    } catch (error) {
      console.error('폴더 삭제 실패:', error);
      setFeedback('폴더 삭제에 실패했습니다.');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const addSentence = async () => {
    if (!newSentence.trim()) {
      setFeedback('영어 문장을 입력하세요.');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    if (!koreanTranslation.trim()) {
      setFeedback('한글 번역을 입력하세요.');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'sentences'), {
        folderId: selectedSentenceFolder.id,
        userId: user.uid,
        english: newSentence.trim(),
        korean: koreanTranslation.trim(),
        createdAt: new Date()
      });
      const newSentenceObj = {
        id: docRef.id,
        folderId: selectedSentenceFolder.id,
        userId: user.uid,
        english: newSentence.trim(),
        korean: koreanTranslation.trim()
      };
      setSentences([...sentences, newSentenceObj]);
      setNewSentence('');
      setKoreanTranslation('');
      setFeedback('문장이 추가되었습니다!');
      setTimeout(() => setFeedback(''), 2000);
    } catch (error) {
      console.error('문장 추가 실패:', error);
      setFeedback('문장 추가에 실패했습니다.');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const updateSentence = async () => {
    if (!editingSentence.trim()) {
      setFeedback('영어 문장을 입력하세요.');
      return;
    }
    if (!editingKorean.trim()) {
      setFeedback('한글 번역을 입력하세요.');
      return;
    }
    try {
      const sentenceRef = doc(db, 'sentences', editingId);
      await updateDoc(sentenceRef, {
        english: editingSentence.trim(),
        korean: editingKorean.trim()
      });
      const newSentences = sentences.map(s =>
        s.id === editingId
          ? { ...s, english: editingSentence.trim(), korean: editingKorean.trim() }
          : s
      );
      setSentences(newSentences);
      setEditingId(null);
      setEditingSentence('');
      setEditingKorean('');
      setFeedback('문장이 수정되었습니다!');
      setTimeout(() => setFeedback(''), 2000);
    } catch (error) {
      console.error('문장 수정 실패:', error);
      setFeedback('문장 수정에 실패했습니다.');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const deleteSentence = async (id) => {
    if (!window.confirm('이 문장을 삭제하시겠습니까?')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'sentences', id));
      const newSentences = sentences.filter(s => s.id !== id);
      setSentences(newSentences);
      setFeedback('문장이 삭제되었습니다!');
      setTimeout(() => setFeedback(''), 2000);
    } catch (error) {
      console.error('문장 삭제 실패:', error);
      setFeedback('문장 삭제에 실패했습니다.');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const autoTranslate = async (text) => {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ko`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.responseStatus === 200) {
        return data.responseData.translatedText;
      }
      return '';
    } catch (error) {
      console.error('번역 오류:', error);
      return '';
    }
  };

  const handleAutoTranslate = async () => {
    if (!newSentence.trim()) {
      setFeedback('영어 문장을 입력하세요.');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    setFeedback('번역 중...');
    const translation = await autoTranslate(newSentence);
    if (translation) {
      setKoreanTranslation(translation);
      setFeedback('자동 번역이 완료되었습니다!');
      setTimeout(() => setFeedback(''), 2000);
    } else {
      setFeedback('번역에 실패했습니다.');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const handleEditAutoTranslate = async () => {
    if (!editingSentence.trim()) {
      setFeedback('영어 문장을 입력하세요.');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    setFeedback('번역 중...');
    const translation = await autoTranslate(editingSentence);
    if (translation) {
      setEditingKorean(translation);
      setFeedback('자동 번역이 완료되었습니다!');
      setTimeout(() => setFeedback(''), 2000);
    } else {
      setFeedback('번역에 실패했습니다.');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const startPracticeMode = (type) => {
    if (sentences.length === 0) {
      setFeedback('등록된 문장이 없습니다.');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    setPracticeMode(type);
    const randomized = [...sentences].sort(() => Math.random() - 0.5);
    setRandomizedSentences(randomized);
    setFailedSentences([]);
    setCurrentQuizIndex(0);
    setSelectedWords([]);
    setUserInput('');
    setWordOpacity({});
    initializeQuiz(randomized[0], type);
    setSentenceMode('practice');
  };

  const initializeQuiz = (sentence, type) => {
    if (type === 'arrange') {
      const words = sentence.english.split(/\s+/);
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setShuffledWords(shuffled);
      setSelectedWords([]);
    } else {
      setUserInput('');
      const words = sentence.english.split(/\s+/);
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setShuffledWords(shuffled);
      const newOpacity = {};
      shuffled.forEach((_, idx) => {
        newOpacity[idx] = 1;
      });
      setWordOpacity(newOpacity);
    }
    setQuizFeedback('');
  };

  const toggleWord = (word, idx) => {
    const isSelected = selectedWords.some(w => w.idx === idx);
    if (isSelected) {
      setSelectedWords(selectedWords.filter(w => w.idx !== idx));
    } else {
      setSelectedWords([...selectedWords, { word, idx }]);
    }
  };

  const toggleWordOpacity = (idx) => {
    setWordOpacity({
      ...wordOpacity,
      [idx]: wordOpacity[idx] === 1 ? 0.3 : 1
    });
  };

  const handleDragStart = (word, idx) => {
    setDraggedWord(word);
    setDraggedFromIndex(idx);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropOnSlot = (slotIndex) => {
    if (draggedWord !== null) {
      const newSelected = [...selectedWords];
      newSelected[slotIndex] = { word: draggedWord, idx: draggedFromIndex };
      setSelectedWords(newSelected);
      setDraggedWord(null);
      setDraggedFromIndex(null);
    }
  };

  const checkAnswerArrange = () => {
    const userAnswer = selectedWords.map(w => w.word).join(' ');
    const correctAnswer = randomizedSentences[currentQuizIndex].english;
    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      setQuizFeedback('✓ 정답입니다!');
    } else {
      setQuizFeedback(`✗ 틀렸습니다. 정답: ${correctAnswer}`);
      const failedSentence = randomizedSentences[currentQuizIndex];
      if (!failedSentences.find(fs => fs.id === failedSentence.id)) {
        setFailedSentences([...failedSentences, failedSentence]);
      }
    }
  };

  const checkAnswerTyping = () => {
    const correctAnswer = randomizedSentences[currentQuizIndex].english;
    if (userInput.trim().toLowerCase() === correctAnswer.toLowerCase()) {
      setQuizFeedback('✓ 정답입니다!');
    } else {
      setQuizFeedback(`✗ 틀렸습니다. 정답: ${correctAnswer}`);
      const failedSentence = randomizedSentences[currentQuizIndex];
      if (!failedSentences.find(fs => fs.id === failedSentence.id)) {
        setFailedSentences([...failedSentences, failedSentence]);
      }
    }
  };

  const nextQuiz = () => {
    if (currentQuizIndex < randomizedSentences.length - 1) {
      const nextIndex = currentQuizIndex + 1;
      setCurrentQuizIndex(nextIndex);
      if (practiceMode === 'arrange') {
        setSelectedWords([]);
      } else {
        setUserInput('');
      }
      initializeQuiz(randomizedSentences[nextIndex], practiceMode);
    } else if (failedSentences.length > 0) {
      setRandomizedSentences(failedSentences);
      setFailedSentences([]);
      setCurrentQuizIndex(0);
      if (practiceMode === 'arrange') {
        setSelectedWords([]);
      } else {
        setUserInput('');
      }
      initializeQuiz(failedSentences[0], practiceMode);
      setFeedback('틀린 문제를 다시 풉니다!');
      setTimeout(() => setFeedback(''), 2000);
    } else {
      setSentenceMode('main');
      setPracticeMode(null);
      setFeedback('모든 문장을 풀었습니다!');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  if (sentenceMode === 'folderSelect') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">문장 폴더 선택</h1>
              <p className="text-gray-600">{user?.displayName}님</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <Home size={20} /> 메인
              </button>
              <button
                onClick={onLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <LogOut size={20} /> 로그아웃
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* 전체 폴더 */}
            <div
              className="bg-gradient-to-br from-gray-100 to-gray-100 rounded-lg shadow-lg p-6 hover:shadow-xl transition border-2 border-gray-300"
            >
              <button
                onClick={() => selectSentenceFolder({ id: 'all', name: '전체', userId: user.uid })}
                className="w-full text-left hover:opacity-80 transition"
              >
                <BookOpen size={48} className="text-gray-600 mb-2" />
                <h3 className="text-xl font-bold text-gray-800">전체</h3>
                <p className="text-sm text-gray-600 mt-1">모든 폴더의 문장</p>
              </button>
            </div>
           
            {sentenceFolders.map(folder => (
              <div
                key={folder.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <button
                    onClick={() => selectSentenceFolder(folder)}
                    className="flex-1 text-left hover:opacity-80 transition"
                  >
                    <Folder size={48} className="text-gray-500 mb-2" />
                    <h3 className="text-xl font-bold text-gray-800">{folder.name}</h3>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSentenceFolder(folder.id);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 flex-shrink-0"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {!showNewSentenceFolderInput ? (
            <button
              onClick={() => setShowNewSentenceFolderInput(true)}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <FolderPlus size={20} /> 새 폴더 생성
            </button>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newSentenceFolderName}
                  onChange={(e) => setNewSentenceFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createSentenceFolder()}
                  placeholder="폴더 이름을 입력하세요..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                  autoFocus
                />
                <button
                  onClick={createSentenceFolder}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  생성
                </button>
                <button
                  onClick={() => setShowNewSentenceFolderInput(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  취소
                </button>
              </div>
              {feedback && <p className="mt-3 text-sm font-medium px-3 py-2 rounded-lg bg-gray-100 text-gray-700">{feedback}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (sentenceMode === 'main') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{selectedSentenceFolder?.name}</h1>
              <p className="text-gray-600">등록된 문장: {sentences.length}개</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSentenceMode('folderSelect')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <Folder size={20} /> 폴더 선택
              </button>
              <button
                onClick={onBack}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <Home size={20} /> 메인
              </button>
              <button
                onClick={onLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <LogOut size={20} /> 로그아웃
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {selectedSentenceFolder?.id !== 'all' && (
              <button onClick={() => setSentenceMode('register')} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:scale-105">
                <Plus size={48} className="text-gray-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">문장 등록</h2>
                <p className="text-gray-600">새로운 문장을 추가하고 관리하세요</p>
              </button>
            )}
            <button
              onClick={() => startPracticeMode('arrange')}
              disabled={sentences.length === 0}
              className={`rounded-lg shadow-lg p-8 transition transform ${sentences.length === 0 ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:shadow-xl hover:scale-105'}`}
            >
              <BookOpen size={48} className={`mx-auto mb-4 ${sentences.length === 0 ? 'text-gray-400' : 'text-gray-600'}`} />
              <h2 className={`text-2xl font-bold mb-2 ${sentences.length === 0 ? 'text-gray-400' : 'text-gray-800'}`}>단어 배열</h2>
              <p className={sentences.length === 0 ? 'text-gray-400' : 'text-gray-600'}>{sentences.length === 0 ? '먼저 문장을 등록하세요' : '단어를 배열해 문장 완성'}</p>
            </button>
            <button
              onClick={() => startPracticeMode('typing')}
              disabled={sentences.length === 0}
              className={`rounded-lg shadow-lg p-8 transition transform ${sentences.length === 0 ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:shadow-xl hover:scale-105'}`}
            >
              <Edit2 size={48} className={`mx-auto mb-4 ${sentences.length === 0 ? 'text-gray-400' : 'text-gray-600'}`} />
              <h2 className={`text-2xl font-bold mb-2 ${sentences.length === 0 ? 'text-gray-400' : 'text-gray-800'}`}>단어 입력</h2>
              <p className={sentences.length === 0 ? 'text-gray-400' : 'text-gray-600'}>{sentences.length === 0 ? '먼저 문장을 등록하세요' : '직접 입력해 문장 완성'}</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (sentenceMode === 'register') {
    if (selectedSentenceFolder?.id === 'all') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 mb-8">
              <button onClick={() => setSentenceMode('main')} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
                <Home size={20} /> 메인
              </button>
              <button onClick={() => setSentenceMode('folderSelect')} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
                <Folder size={20} /> 폴더 선택
              </button>
            </div>
            <div className="bg-gray-100 border-2 border-gray-400 rounded-lg p-8 text-center">
              <p className="text-xl text-gray-800 font-semibold">전체 폴더에서는 문장을 등록할 수 없습니다.</p>
              <p className="text-gray-600 mt-2">특정 폴더를 선택해주세요.</p>
            </div>
          </div>
        </div>
      );
    }
   
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4 mb-8">
            <button onClick={() => setSentenceMode('main')} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
              <Home size={20} /> 메인
            </button>
            <button onClick={() => setSentenceMode('folderSelect')} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
              <Folder size={20} /> 폴더 선택
            </button>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">문장 관리</h1>
          <p className="text-gray-600 mb-8">문장을 등록, 수정, 삭제하세요</p>
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">새 문장 등록</h2>
            <div className="space-y-3 mb-4">
              <input
                type="text"
                value={newSentence}
                onChange={(e) => setNewSentence(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSentence()}
                placeholder="영어 문장을 입력하세요..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
              <input
                type="text"
                value={koreanTranslation}
                onChange={(e) => setKoreanTranslation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSentence()}
                placeholder="한글 번역을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div className="flex gap-3 mb-4">
              <button onClick={handleAutoTranslate} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition">자동 번역</button>
              <button onClick={addSentence} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
                <Plus size={20} /> 추가
              </button>
            </div>
            {feedback && <p className="mt-3 text-sm font-medium px-3 py-2 rounded-lg bg-gray-100 text-gray-700">{feedback}</p>}
          </div>
          {editingId && (
            <div className="bg-gray-50 border-2 border-gray-300 rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">문장 수정</h2>
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  value={editingSentence}
                  onChange={(e) => setEditingSentence(e.target.value)}
                  placeholder="영어 문장을 입력하세요..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
                <input
                  type="text"
                  value={editingKorean}
                  onChange={(e) => setEditingKorean(e.target.value)}
                  placeholder="한글 번역"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <div className="flex gap-3 mb-4">
                <button onClick={handleEditAutoTranslate} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition">자동 번역</button>
                <button onClick={updateSentence} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition">저장</button>
                <button onClick={() => { setEditingId(null); setEditingSentence(''); setEditingKorean(''); }} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold transition">취소</button>
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">등록된 문장 ({sentences.length})</h2>
            <div className="space-y-3">
              {sentences.length === 0 ? (
                <p className="text-gray-500 text-sm">등록된 문장이 없습니다.</p>
              ) : (
                sentences.map((sentence) => (
                  <div key={sentence.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 break-words">{sentence.english}</p>
                        <p className="text-xs text-gray-600 mt-1 break-words">{sentence.korean}</p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => { setEditingId(sentence.id); setEditingSentence(sentence.english); setEditingKorean(sentence.korean); }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => deleteSentence(sentence.id)} className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sentenceMode === 'practice') {
    const currentSentence = randomizedSentences[currentQuizIndex];
    const progress = currentQuizIndex + 1;
    
    if (practiceMode === 'arrange') {
      const emptySlots = Math.max(0, currentSentence.english.split(/\s+/).length - selectedWords.length);
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 mb-8">
              <button onClick={() => setSentenceMode('main')} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
                <Home size={20} /> 메인
              </button>
              <button onClick={() => setSentenceMode('folderSelect')} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
                <Folder size={20} /> 폴더 선택
              </button>
            </div>
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">단어 배열 연습</h1>
              <div className="flex justify-between items-center">
                <p className="text-gray-600">한글을 보고 영어 문장을 배열하세요</p>
                <p className="text-lg font-semibold text-gray-700">{progress} / {randomizedSentences.length}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div className="bg-gray-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(progress / randomizedSentences.length) * 100}%` }}></div>
              </div>
              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 mb-8">
                <p className="text-gray-700 font-medium text-lg">{currentSentence.korean}</p>
              </div>
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">단어 선택 (클릭 또는 드래그):</p>
                <div className="bg-gray-50 rounded-lg p-4 min-h-20 flex flex-wrap gap-2 items-start content-start border border-gray-200">
                  {selectedWords.length === 0 && emptySlots === currentSentence.english.split(/\s+/).length ? (
                    <p className="text-gray-500 text-sm">아래에서 단어를 선택하거나 드래그하세요</p>
                  ) : (
                    <>
                      {selectedWords.map((w, idx) => (
                        <button
                          key={idx}
                          onClick={() => { const newSelected = selectedWords.filter((_, i) => i !== idx); setSelectedWords(newSelected); }}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer"
                        >
                          {w.word}
                        </button>
                      ))}
                      {Array.from({ length: emptySlots }).map((_, idx) => (
                        <div
                          key={`empty-${idx}`}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDropOnSlot(selectedWords.length + idx)}
                          className="border-2 border-dashed border-gray-300 rounded-full px-4 py-2 min-w-20 text-center text-gray-400 text-sm hover:bg-gray-100 transition"
                        >
                          _
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">사용 가능한 단어:</p>
                <div className="flex flex-wrap gap-2">
                  {shuffledWords.map((word, idx) => {
                    const isSelected = selectedWords.some(w => w.idx === idx);
                    return (
                      <button
                        key={idx}
                        draggable
                        onDragStart={() => handleDragStart(word, idx)}
                        onClick={() => toggleWord(word, idx)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          isSelected
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-gray-500 hover:bg-gray-600 text-white cursor-grab active:cursor-grabbing'
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-3 mb-6">
                <button onClick={checkAnswerArrange} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition">확인</button>
                <button onClick={() => { setSelectedWords([]); setQuizFeedback(''); }} className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
                  <RotateCcw size={20} /> 초기화
                </button>
              </div>
              {quizFeedback && (
                <div className={`p-4 rounded-lg font-semibold text-center ${quizFeedback.startsWith('✓') ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700'}`}>
                  {quizFeedback}
                  {progress < randomizedSentences.length || failedSentences.length > 0 ? (
                    <button onClick={nextQuiz} className="block w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition">다음 문제</button>
                  ) : (
                    <button onClick={() => setSentenceMode('main')} className="block w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition">메인으로 돌아가기</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 mb-8">
              <button onClick={() => setSentenceMode('main')} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
                <Home size={20} /> 메인
              </button>
              <button onClick={() => setSentenceMode('folderSelect')} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
                <Folder size={20} /> 폴더 선택
              </button>
            </div>
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">단어 입력 연습</h1>
              <div className="flex justify-between items-center">
                <p className="text-gray-600">한글을 보고 영어 문장을 입력하세요</p>
                <p className="text-lg font-semibold text-gray-700">{progress} / {randomizedSentences.length}</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div className="bg-gray-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(progress / randomizedSentences.length) * 100}%` }}></div>
              </div>
              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6 mb-8">
                <p className="text-gray-700 font-medium text-lg">{currentSentence.korean}</p>
              </div>
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">단어 카드 (클릭하여 보기/숨기기):</p>
                <div className="flex flex-wrap gap-3 mb-6">
                  {shuffledWords.map((word, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleWordOpacity(idx)}
                      className="px-6 py-3 rounded-lg font-semibold transition bg-gray-500 text-white hover:bg-gray-600"
                      style={{ opacity: wordOpacity[idx] || 1 }}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">영어 문장을 입력하세요:</p>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkAnswerTyping()}
                  placeholder="영어 문장을 입력하세요..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 text-lg"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 mb-6">
                <button onClick={checkAnswerTyping} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition">확인</button>
                <button onClick={() => { setUserInput(''); setQuizFeedback(''); }} className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
                  <RotateCcw size={20} /> 초기화
                </button>
              </div>
              {quizFeedback && (
                <div className={`p-4 rounded-lg font-semibold text-center ${quizFeedback.startsWith('✓') ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700'}`}>
                  {quizFeedback}
                  {progress < randomizedSentences.length || failedSentences.length > 0 ? (
                    <button onClick={nextQuiz} className="block w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition">다음 문제</button>
                  ) : (
                    <button onClick={() => setSentenceMode('main')} className="block w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition">메인으로 돌아가기</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  }
}
