import React, { useState, useEffect } from 'react';
import { Trash2, Plus, RotateCcw, Edit2, BookOpen, LogOut, Home, FolderPlus, Folder } from 'lucide-react';

export default function EnglishPracticeApp() {
  const [user, setUser] = useState(null);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [sentences, setSentences] = useState([]);
  const [newSentence, setNewSentence] = useState('');
  const [koreanTranslation, setKoreanTranslation] = useState('');
  const [mode, setMode] = useState('login');
  const [feedback, setFeedback] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingSentence, setEditingSentence] = useState('');
  const [editingKorean, setEditingKorean] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

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

  useEffect(() => {
    const storedFolders = JSON.parse(localStorage.getItem('folders') || '[]');
    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (storedFolders.length > 0 && storedUser) {
      setFolders(storedFolders);
      setUser(storedUser);
      setMode('folderSelect');
    }
  }, []);

  const handleGoogleLogin = () => {
    const userName = prompt('사용자 이름을 입력하세요:');
    if (userName) {
      setUser({ name: userName });
      localStorage.setItem('user', JSON.stringify({ name: userName }));
      setMode('folderSelect');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedFolder(null);
    setSentences([]);
    setMode('login');
    localStorage.removeItem('user');
  };

  const createFolder = () => {
    if (!newFolderName.trim()) {
      setFeedback('폴더 이름을 입력하세요.');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    const newFolder = {
      id: Date.now(),
      name: newFolderName,
      sentences: []
    };
    const updatedFolders = [...folders, newFolder];
    setFolders(updatedFolders);
    localStorage.setItem('folders', JSON.stringify(updatedFolders));
    setNewFolderName('');
    setShowNewFolderInput(false);
    setFeedback('폴더가 생성되었습니다!');
    setTimeout(() => setFeedback(''), 2000);
  };

  const selectFolder = (folder) => {
    setSelectedFolder(folder);
    setSentences(folder.sentences);
    setMode(null);
  };

  const saveSentencesToFolder = () => {
    const updatedFolders = folders.map(f =>
      f.id === selectedFolder.id ? { ...f, sentences } : f
    );
    setFolders(updatedFolders);
    localStorage.setItem('folders', JSON.stringify(updatedFolders));
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
    const newSentenceObj = {
      id: Date.now(),
      english: newSentence.trim(),
      korean: koreanTranslation.trim(),
    };
    const newSentences = [...sentences, newSentenceObj];
    setSentences(newSentences);
    setSelectedFolder({ ...selectedFolder, sentences: newSentences });
    saveSentencesToFolder();
    setNewSentence('');
    setKoreanTranslation('');
    setFeedback('문장이 추가되었습니다!');
    setTimeout(() => setFeedback(''), 2000);
  };

  const updateSentence = () => {
    if (!editingSentence.trim()) {
      setFeedback('영어 문장을 입력하세요.');
      return;
    }
    if (!editingKorean.trim()) {
      setFeedback('한글 번역을 입력하세요.');
      return;
    }
    const newSentences = sentences.map(s =>
      s.id === editingId
        ? { ...s, english: editingSentence.trim(), korean: editingKorean.trim() }
        : s
    );
    setSentences(newSentences);
    setSelectedFolder({ ...selectedFolder, sentences: newSentences });
    saveSentencesToFolder();
    setEditingId(null);
    setEditingSentence('');
    setEditingKorean('');
    setFeedback('문장이 수정되었습니다!');
    setTimeout(() => setFeedback(''), 2000);
  };

  const deleteSentence = (id) => {
    const newSentences = sentences.filter(s => s.id !== id);
    setSentences(newSentences);
    setSelectedFolder({ ...selectedFolder, sentences: newSentences });
    saveSentencesToFolder();
    setFeedback('문장이 삭제되었습니다!');
    setTimeout(() => setFeedback(''), 2000);
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
    initializeQuiz(randomized[0], type);
    setMode('practice');
  };

  const initializeQuiz = (sentence, type) => {
    if (type === 'arrange') {
      const words = sentence.english.split(/\s+/);
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setShuffledWords(shuffled);
      setSelectedWords([]);
    } else {
      setUserInput('');
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
      setMode(null);
      setPracticeMode(null);
      setFeedback('모든 문장을 풀었습니다!');
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-2xl p-12 max-w-md w-full">
          <BookOpen size={64} className="text-blue-600 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center">영어 배열 연습</h1>
          <p className="text-gray-600 text-center mb-8">문장을 등록하고 단어를 배열해서 영어를 연습하세요</p>
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            시작하기
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'folderSelect') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">폴더 선택</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              <LogOut size={20} /> 로그아웃
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => selectFolder(folder)}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition transform hover:scale-105 text-left"
              >
                <Folder size={48} className="text-yellow-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-800">{folder.name}</h3>
                <p className="text-gray-600 mt-2">{folder.sentences.length}개 문장</p>
              </button>
            ))}
          </div>

          {!showNewFolderInput ? (
            <button
              onClick={() => setShowNewFolderInput(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
            >
              <FolderPlus size={20} /> 새 폴더 생성
            </button>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                  placeholder="폴더 이름을 입력하세요..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={createFolder}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  생성
                </button>
                <button
                  onClick={() => setShowNewFolderInput(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold transition"
                >
                  취소
                </button>
              </div>
              {feedback && <p className="mt-3 text-sm font-medium px-3 py-2 rounded-lg bg-green-100 text-green-700">{feedback}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{selectedFolder?.name}</h1>
              <p className="text-gray-600">등록된 문장: {sentences.length}개</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setMode('folderSelect')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <Folder size={20} /> 폴더 선택
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <LogOut size={20} /> 로그아웃
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button onClick={() => setMode('register')} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:scale-105">
              <Plus size={48} className="text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">문장 등록</h2>
              <p className="text-gray-600">새로운 문장을 추가하고 관리하세요</p>
            </button>

            <button
              onClick={() => startPracticeMode('arrange')}
              disabled={sentences.length === 0}
              className={`rounded-lg shadow-lg p-8 transition transform ${sentences.length === 0 ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:shadow-xl hover:scale-105'}`}
            >
              <BookOpen size={48} className={`mx-auto mb-4 ${sentences.length === 0 ? 'text-gray-400' : 'text-green-600'}`} />
              <h2 className={`text-2xl font-bold mb-2 ${sentences.length === 0 ? 'text-gray-400' : 'text-gray-800'}`}>단어 배열</h2>
              <p className={sentences.length === 0 ? 'text-gray-400' : 'text-gray-600'}>{sentences.length === 0 ? '먼저 문장을 등록하세요' : '단어를 배열해 문장 완성'}</p>
            </button>

            <button
              onClick={() => startPracticeMode('typing')}
              disabled={sentences.length === 0}
              className={`rounded-lg shadow-lg p-8 transition transform ${sentences.length === 0 ? 'bg-gray-200 cursor-not-allowed' : 'bg-white hover:shadow-xl hover:scale-105'}`}
            >
              <Edit2 size={48} className={`mx-auto mb-4 ${sentences.length === 0 ? 'text-gray-400' : 'text-purple-600'}`} />
              <h2 className={`text-2xl font-bold mb-2 ${sentences.length === 0 ? 'text-gray-400' : 'text-gray-800'}`}>단어 입력</h2>
              <p className={sentences.length === 0 ? 'text-gray-400' : 'text-gray-600'}>{sentences.length === 0 ? '먼저 문장을 등록하세요' : '직접 입력해 문장 완성'}</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-4 mb-8">
            <button onClick={() => setMode(null)} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
              <Home size={20} /> 메인
            </button>
            <button onClick={() => setMode('folderSelect')} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={koreanTranslation}
                onChange={(e) => setKoreanTranslation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSentence()}
                placeholder="한글 번역을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 mb-4">
              <button onClick={handleAutoTranslate} className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold transition">자동 번역</button>
              <button onClick={addSentence} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition">
                <Plus size={20} /> 추가
              </button>
            </div>
            {feedback && <p className="mt-3 text-sm font-medium px-3 py-2 rounded-lg bg-green-100 text-green-700">{feedback}</p>}
          </div>

          {editingId && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">문장 수정</h2>
              <div className="space-y-3 mb-4">
                <input
                  type="text"
                  value={editingSentence}
                  onChange={(e) => setEditingSentence(e.target.value)}
                  placeholder="영어 문장을 입력하세요..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <input
                  type="text"
                  value={editingKorean}
                  onChange={(e) => setEditingKorean(e.target.value)}
                  placeholder="한글 번역"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="flex gap-3 mb-4">
                <button onClick={handleEditAutoTranslate} className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold transition">자동 번역</button>
                <button onClick={updateSentence} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold transition">저장</button>
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
                          className="p-2 hover:bg-blue-100 rounded-lg transition text-blue-600"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => deleteSentence(sentence.id)} className="p-2 hover:bg-red-100 rounded-lg transition text-red-600">
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

  if (mode === 'practice') {
    const currentSentence = randomizedSentences[currentQuizIndex];
    const progress = currentQuizIndex + 1;

    if (practiceMode === 'arrange') {
      const emptySlots = Math.max(0, currentSentence.english.split(/\s+/).length - selectedWords.length);

      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 mb-8">
              <button onClick={() => setMode(null)} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
                <Home size={20} /> 메인
              </button>
              <button onClick={() => setMode('folderSelect')} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
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
                <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(progress / randomizedSentences.length) * 100}%` }}></div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-8">
                <p className="text-gray-700 font-medium text-lg">{currentSentence.korean}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">단어 선택 (클릭 또는 드래그):</p>
                <div className="bg-blue-50 rounded-lg p-4 min-h-20 flex flex-wrap gap-2 items-start content-start border border-blue-200">
                  {selectedWords.length === 0 && emptySlots === currentSentence.english.split(/\s+/).length ? (
                    <p className="text-gray-500 text-sm">아래에서 단어를 선택하거나 드래그하세요</p>
                  ) : (
                    <>
                      {selectedWords.map((w, idx) => (
                        <button
                          key={idx}
                          onClick={() => { const newSelected = selectedWords.filter((_, i) => i !== idx); setSelectedWords(newSelected); }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition cursor-pointer"
                        >
                          {w.word}
                        </button>
                      ))}
                      {Array.from({ length: emptySlots }).map((_, idx) => (
                        <div
                          key={`empty-${idx}`}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDropOnSlot(selectedWords.length + idx)}
                          className="border-2 border-dashed border-blue-300 rounded-full px-4 py-2 min-w-20 text-center text-gray-400 text-sm hover:bg-blue-100 transition"
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
                            : 'bg-green-500 hover:bg-green-600 text-white cursor-grab active:cursor-grabbing'
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 mb-6">
                <button onClick={checkAnswerArrange} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition">다음 문제</button>
                <button onClick={() => { setSelectedWords([]); setQuizFeedback(''); }} className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
                  <RotateCcw size={20} /> 초기화
                </button>
              </div>

              {quizFeedback && (
                <div className={`p-4 rounded-lg font-semibold text-center ${quizFeedback.startsWith('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {quizFeedback}
                  {progress < randomizedSentences.length || failedSentences.length > 0 ? (
                    <button onClick={nextQuiz} className="block w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition">다음 문제</button>
                  ) : (
                    <button onClick={() => setMode(null)} className="block w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition">메인으로 돌아가기</button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4 mb-8">
              <button onClick={() => setMode(null)} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
                <Home size={20} /> 메인
              </button>
              <button onClick={() => setMode('folderSelect')} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
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
                <div className="bg-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(progress / randomizedSentences.length) * 100}%` }}></div>
              </div>

              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-8">
                <p className="text-gray-700 font-medium text-lg">{currentSentence.korean}</p>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">영어 문장을 입력하세요:</p>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && checkAnswerTyping()}
                  placeholder="영어 문장을 입력하세요..."
                  className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 mb-6">
                <button onClick={checkAnswerTyping} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition">다음 문제</button>
                <button onClick={() => { setUserInput(''); setQuizFeedback(''); }} className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition">
                  <RotateCcw size={20} /> 초기화
                </button>
              </div>

              {quizFeedback && (
                <div className={`p-4 rounded-lg font-semibold text-center ${quizFeedback.startsWith('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {quizFeedback}
                  {progress < randomizedSentences.length || failedSentences.length > 0 ? (
                    <button onClick={nextQuiz} className="block w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition">다음 문제</button>
                  ) : (
                    <button onClick={() => setMode(null)} className="block w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition">메인으로 돌아가기</button>
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