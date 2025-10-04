import React, { useState, useEffect } from 'react';
import { BookOpen, Edit, ChevronRight, Check, X, Home, Plus, Trash2, Save, LogOut } from 'lucide-react';
import './App.css';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Your Firebase configuration
// dotenv 불러오기 (파일 상단에 추가, 만약 create-react-app이 아니면 require('dotenv').config();)
// create-react-app이라면 자동으로 process.env를 읽음

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const sampleData = {
  units: {
    "1단원": {
      title: "대한민국 임시정부",
      people: ["김구", "안창호", "이동녕", "이승만"],
      events: ["임시정부수립", "한인애국단조직"],
      places: ["상하이", "충칭"],
      connections: {
        "김구": { events: ["임시정부수립", "한인애국단조직"], places: ["상하이", "충칭"] },
        "안창호": { events: ["임시정부수립"], places: ["상하이"] },
        "이동녕": { events: ["임시정부수립"], places: ["상하이"] },
        "이승만": { events: ["임시정부수립"], places: ["상하이"] }
      },
      eventDetails: {
        "임시정부수립": {
          background: ["3.1 운동", "일제 강점기 해외 독립운동 필요"],
          development: ["독립운동가 상하이 집결", "임시의정원 구성", "임시헌장 제정", "정부 조직"],
          result: ["대한민국 임시정부 수립", "독립운동 기반 마련", "국제적 인정 노력"]
        },
        "한인애국단조직": {
          background: ["임시정부의 무장투쟁 필요", "일제 침략 강화"],
          development: ["김구 주도 조직", "단원 모집", "의열투쟁 계획"],
          result: ["항일 의거 실행", "국민 항일 의식 고취"]
        }
      }
    },
    "2단원": {
      title: "항일 의거",
      people: ["안중근", "윤봉길", "이봉창"],
      events: ["이토히로부미저격", "윤봉길의거", "이봉창의거"],
      places: ["하얼빈", "상하이", "도쿄"],
      connections: {
        "안중근": { events: ["이토히로부미저격"], places: ["하얼빈"] },
        "윤봉길": { events: ["윤봉길의거"], places: ["상하이"] },
        "이봉창": { events: ["이봉창의거"], places: ["도쿄"] }
      },
      eventDetails: {
        "이토히로부미저격": {
          background: ["을사늑약 체결", "일제의 한국 침략"],
          development: ["안중근의 결의", "하얼빈 이동", "저격 실행", "체포"],
          result: ["국제적 주목", "항일 의지 표출"]
        },
        "윤봉길의거": {
          background: ["상하이 임시정부 활동", "일제 만주 침략"],
          development: ["폭탄 제조", "홍커우 공원 투척", "체포"],
          result: ["일제 충격", "중국인 지지 확대"]
        },
        "이봉창의거": {
          background: ["임시정부 한인애국단", "천황 암살 시도"],
          development: ["도쿄 이동", "폭탄 투척", "실패 및 체포"],
          result: ["항일 운동 고무", "국제 여론 환기"]
        }
      }
    }
  },
  allPeople: ["김구", "안창호", "이동녕", "이승만", "안중근", "윤봉길", "이봉창", "이순신", "세종대왕", "신사임당"],
  allEventItems: {
    backgrounds: ["3.1 운동", "일제 강점기 해외 독립운동 필요", "임시정부의 무장투쟁 필요", "일제 침략 강화", "을사늑약 체결", "일제의 한국 침략", "상하이 임시정부 활동", "일제 만주 침략", "임시정부 한인애국단", "천황 암살 시도"],
    developments: ["독립운동가 상하이 집결", "임시의정원 구성", "임시헌장 제정", "정부 조직", "김구 주도 조직", "단원 모집", "의열투쟁 계획", "안중근의 결의", "하얼빈 이동", "저격 실행", "체포", "폭탄 제조", "홍커우 공원 투척", "도쿄 이동", "폭탄 투척", "실패 및 체포"],
    results: ["대한민국 임시정부 수립", "독립운동 기반 마련", "국제적 인정 노력", "항일 의거 실행", "국민 항일 의식 고취", "국제적 주목", "항일 의지 표출", "일제 충격", "중국인 지지 확대", "항일 운동 고무", "국제 여론 환기"]
  }
};

function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin) {
        if (password !== confirmPassword) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }
        if (!passwordRegex.test(password)) {
          throw new Error('비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자, 특수문자(!@#$%^&*)를 포함해야 합니다.');
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        alert('회원가입 성공! 이메일 인증을 확인해주세요.');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2">역사 퀴즈</h1>
        <p className="text-center text-gray-600 mb-8">
          {isLogin ? '로그인하여 시작하세요' : '새 계정 만들기'}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg"
              placeholder="최소 8자, 대/소문자, 숫자, 특수문자 포함"
              required
            />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-2">비밀번호 확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="비밀번호 재입력"
                required
              />
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
          </button>
        </form>

        <div className="mt-4">
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-red-600 text-white p-4 rounded-lg font-bold hover:bg-red-700"
          >
            Google로 {isLogin ? '로그인' : '회원가입'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 text-sm hover:underline"
          >
            {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UnitEditor({ unit, onSave, onCancel }) {
  const [editData, setEditData] = useState({ ...unit, eventDetails: unit.eventDetails || {} });
  const [newPerson, setNewPerson] = useState('');
  const [newEvent, setNewEvent] = useState('');
  const [newPlace, setNewPlace] = useState('');
  const [newSub, setNewSub] = useState({});
  const [selectedPerson, setSelectedPerson] = useState('');

  const addPerson = () => {
    const np = newPerson.trim();
    if (!np) return;
    setEditData({
      ...editData,
      people: [...editData.people, np],
      connections: {
        ...editData.connections,
        [np]: { events: [], places: [] }
      }
    });
    setNewPerson('');
  };

  const addEvent = () => {
    const ne = newEvent.trim();
    if (!ne) return;
    setEditData({
      ...editData,
      events: [...editData.events, ne],
      eventDetails: {
        ...editData.eventDetails,
        [ne]: { background: [], development: [], result: [] }
      }
    });
    setNewEvent('');
  };

  const addPlace = () => {
    const np = newPlace.trim();
    if (!np) return;
    setEditData({ ...editData, places: [...editData.places, np] });
    setNewPlace('');
  };

  const addSubItem = (event, type, value) => {
    const nv = value.trim();
    if (!nv) return;
    const newDetails = { ...editData.eventDetails };
    const det = { ...newDetails[event] };
    det[type] = [...det[type], nv];
    newDetails[event] = det;
    setEditData({ ...editData, eventDetails: newDetails });
    const key = `${event}-${type}`;
    setNewSub({ ...newSub, [key]: '' });
  };

  const removeSubItem = (event, type, index) => {
    const newDetails = { ...editData.eventDetails };
    const det = { ...newDetails[event] };
    det[type] = det[type].filter((_, i) => i !== index);
    newDetails[event] = det;
    setEditData({ ...editData, eventDetails: newDetails });
  };

  const toggleConnection = (person, type, value) => {
    const conn = editData.connections[person] || { events: [], places: [] };
    const list = conn[type] || [];
    const newList = list.includes(value) ? list.filter(v => v !== value) : [...list, value];
    setEditData({
      ...editData,
      connections: {
        ...editData.connections,
        [person]: { ...conn, [type]: newList }
      }
    });
  };

  const removePerson = (index, p) => {
    const newPeople = editData.people.filter((_, i) => i !== index);
    const newConn = { ...editData.connections };
    delete newConn[p];
    setEditData({ ...editData, people: newPeople, connections: newConn });
  };

  const removeEvent = (index, e) => {
    const newEvents = editData.events.filter((_, i) => i !== index);
    const newConn = { ...editData.connections };
    Object.keys(newConn).forEach(p => {
      newConn[p].events = newConn[p].events.filter(ev => ev !== e);
    });
    const newDetails = { ...editData.eventDetails };
    delete newDetails[e];
    setEditData({ ...editData, events: newEvents, connections: newConn, eventDetails: newDetails });
  };

  const removePlace = (index, pl) => {
    const newPlaces = editData.places.filter((_, i) => i !== index);
    const newConn = { ...editData.connections };
    Object.keys(newConn).forEach(p => {
      newConn[p].places = newConn[p].places.filter(p => p !== pl);
    });
    setEditData({ ...editData, places: newPlaces, connections: newConn });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 rounded-xl">
      <button onClick={onCancel} className="mb-6 text-blue-600 flex items-center gap-2">← 목록으로</button>
      <h1 className="text-2xl font-bold mb-8">{unit.key ? '단원 편집' : '새 단원'}</h1>

      <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
      <label className="block mb-2 font-medium">단원명</label>
      <input value={editData.key} onChange={e => setEditData({ ...editData, key: e.target.value })} placeholder="예: 1단원" className="w-full p-3 border rounded-lg mb-4" disabled={!!unit.key} />
      <label className="block mb-2 font-medium">제목</label>
      <input value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} placeholder="예: 대한민국 임시정부" className="w-full p-3 border rounded-lg mb-6" />

      <h2 className="text-xl font-semibold mb-4">👤 인물</h2>
      <div className="flex gap-2 mb-4">
        <input value={newPerson} onChange={e => setNewPerson(e.target.value)} onKeyPress={e => e.key === 'Enter' && addPerson()} placeholder="인물 이름 (Enter)" className="flex-1 p-3 border rounded-lg" />
        <button onClick={addPerson} className="bg-blue-600 text-white p-3 rounded-lg"><Plus size={20} /></button>
      </div>
      <div className="space-y-2 mb-6">
        {editData.people.map((p, i) => (
          <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg">
            <span>{p}</span>
            <button onClick={() => removePerson(i, p)} className="text-red-600"><Trash2 size={20} /></button>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">📅 사건</h2>
      <div className="flex gap-2 mb-4">
        <input value={newEvent} onChange={e => setNewEvent(e.target.value)} onKeyPress={e => e.key === 'Enter' && addEvent()} placeholder="사건 이름 (Enter)" className="flex-1 p-3 border rounded-lg" />
        <button onClick={addEvent} className="bg-blue-600 text-white p-3 rounded-lg"><Plus size={20} /></button>
      </div>
      <div className="space-y-2 mb-6">
        {editData.events.map((e, i) => (
          <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg">
            <span>{e}</span>
            <button onClick={() => removeEvent(i, e)} className="text-red-600"><Trash2 size={20} /></button>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">📍 장소</h2>
      <div className="flex gap-2 mb-4">
        <input value={newPlace} onChange={e => setNewPlace(e.target.value)} onKeyPress={e => e.key === 'Enter' && addPlace()} placeholder="장소 이름 (Enter)" className="flex-1 p-3 border rounded-lg" />
        <button onClick={addPlace} className="bg-blue-600 text-white p-3 rounded-lg"><Plus size={20} /></button>
      </div>
      <div className="space-y-2 mb-6">
        {editData.places.map((p, i) => (
          <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg">
            <span>{p}</span>
            <button onClick={() => removePlace(i, p)} className="text-red-600"><Trash2 size={20} /></button>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">🔗 연결 관계</h2>
      <p className="mb-4">각 인물이 참여한 사건과 활동 장소를 선택하세요</p>
      <select value={selectedPerson} onChange={e => setSelectedPerson(e.target.value)} className="w-full p-3 border rounded-lg mb-4">
        <option>인물 선택</option>
        {editData.people.map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      {selectedPerson && (
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">참여한 사건</h3>
            <div className="space-y-2">
              {editData.events.map(ev => (
                <div key={ev} className="flex items-center gap-2">
                  <input type="checkbox" checked={(editData.connections[selectedPerson]?.events || []).includes(ev)} onChange={() => toggleConnection(selectedPerson, 'events', ev)} className="w-4 h-4" />
                  {ev}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">활동한 장소</h3>
            <div className="space-y-2">
              {editData.places.map(pl => (
                <div key={pl} className="flex items-center gap-2">
                  <input type="checkbox" checked={(editData.connections[selectedPerson]?.places || []).includes(pl)} onChange={() => toggleConnection(selectedPerson, 'places', pl)} className="w-4 h-4" />
                  {pl}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold mb-4 mt-8">📋 사건 상세</h2>
      {editData.events.map(event => (
        <div key={event} className="mb-6 bg-white p-4 rounded-lg">
          <h3 className="text-lg font-bold mb-4">{event}</h3>

          <div className="mb-4">
            <h4 className="font-medium mb-2">배경</h4>
            <div className="flex gap-2 mb-2">
              <input
                value={newSub[`${event}-background`] || ''}
                onChange={e => setNewSub({ ...newSub, [`${event}-background`]: e.target.value })}
                onKeyPress={e => e.key === 'Enter' && addSubItem(event, 'background', newSub[`${event}-background`])}
                placeholder="배경 추가 (Enter)"
                className="flex-1 p-3 border rounded-lg"
              />
              <button onClick={() => addSubItem(event, 'background', newSub[`${event}-background`])} className="bg-blue-600 text-white p-3 rounded-lg"><Plus size={20} /></button>
            </div>
            <div className="space-y-2">
              {(editData.eventDetails[event]?.background || []).map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span>{item}</span>
                  <button onClick={() => removeSubItem(event, 'background', i)} className="text-red-600"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium mb-2">전개</h4>
            <div className="flex gap-2 mb-2">
              <input
                value={newSub[`${event}-development`] || ''}
                onChange={e => setNewSub({ ...newSub, [`${event}-development`]: e.target.value })}
                onKeyPress={e => e.key === 'Enter' && addSubItem(event, 'development', newSub[`${event}-development`])}
                placeholder="전개 추가 (Enter)"
                className="flex-1 p-3 border rounded-lg"
              />
              <button onClick={() => addSubItem(event, 'development', newSub[`${event}-development`])} className="bg-blue-600 text-white p-3 rounded-lg"><Plus size={20} /></button>
            </div>
            <div className="space-y-2">
              {(editData.eventDetails[event]?.development || []).map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span>{item}</span>
                  <button onClick={() => removeSubItem(event, 'development', i)} className="text-red-600"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">결과 및 의의</h4>
            <div className="flex gap-2 mb-2">
              <input
                value={newSub[`${event}-result`] || ''}
                onChange={e => setNewSub({ ...newSub, [`${event}-result`]: e.target.value })}
                onKeyPress={e => e.key === 'Enter' && addSubItem(event, 'result', newSub[`${event}-result`])}
                placeholder="결과 및 의의 추가 (Enter)"
                className="flex-1 p-3 border rounded-lg"
              />
              <button onClick={() => addSubItem(event, 'result', newSub[`${event}-result`])} className="bg-blue-600 text-white p-3 rounded-lg"><Plus size={20} /></button>
            </div>
            <div className="space-y-2">
              {(editData.eventDetails[event]?.result || []).map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <span>{item}</span>
                  <button onClick={() => removeSubItem(event, 'result', i)} className="text-red-600"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="flex gap-4 mt-8">
        <button onClick={onCancel} className="flex-1 bg-gray-200 p-4 rounded-lg font-bold">취소</button>
        <button onClick={() => onSave(editData)} className="flex-1 bg-blue-600 text-white p-4 rounded-lg font-bold flex items-center justify-center gap-2">
          <Save size={20} /> 저장
        </button>
      </div>
    </div>
  );
}

function ExitModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">퀴즈 종료</h2>
        <p className="mb-6">퀴즈를 종료하시겠습니까?</p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 bg-gray-200 p-3 rounded-lg font-bold">취소</button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 text-white p-3 rounded-lg font-bold">종료</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState(sampleData);
  const [screen, setScreen] = useState('home');
  const [editUnit, setEditUnit] = useState(null);
  const [settings, setSettings] = useState({ unit: '1단원', questionCount: 10 });
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState([]);
  const [generatedQuestions, setGeneratedQuestions] = useState(new Set()); // To track unique questions
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = doc(db, 'users', currentUser.uid);
        getDoc(userDoc).then((docSnap) => {
          if (docSnap.exists()) {
            setData(docSnap.data().quizData || sampleData);
          } else {
            setDoc(userDoc, { quizData: sampleData });
            setData(sampleData);
          }
        });
      } else {
        setData(sampleData);
      }
    });
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    signOut(auth);
    setData(sampleData);
  };

  const isQuestionUnique = (q) => {
    const questionKey = `${q.type}|${q.question}|${q.options.sort().join(',')}`;
    return !generatedQuestions.has(questionKey);
  };

  const generateQuiz = () => {
    const unit = data.units[settings.unit];
    const questions = [];
    const types = ['person-event', 'person-place', 'event-person', 'event-place', 'event-background', 'event-development', 'event-result'];
    const newGenerated = new Set();

    while (questions.length < settings.questionCount) {
      const type = types[Math.floor(Math.random() * types.length)];
      const q = generateQuestion(type, unit, data);
      if (q && isQuestionUnique(q)) {
        questions.push(q);
        const questionKey = `${q.type}|${q.question}|${q.options.sort().join(',')}`;
        newGenerated.add(questionKey);
      }
    }

    setQuiz(questions);
    setGeneratedQuestions(newGenerated);
    setCurrentQ(0);
    setSelected([]);
    setShowAnswer(false);
    setResults([]);
    setScreen('quiz');
  };

  const generateQuestion = (type, unit, data) => {
    if (type === 'person-event') {
      const person = unit.people[Math.floor(Math.random() * unit.people.length)];
      const events = unit.connections[person]?.events || [];
      if (events.length === 0) return null;
      const k = Math.floor(Math.random() * events.length) + 1;
      const answer = events.sort(() => 0.5 - Math.random()).slice(0, k);
      const nonAnswer = unit.events.filter(e => !answer.includes(e));
      const globalNonUnit = data.units[Object.keys(data.units).find(u => u !== settings.unit)]?.events || [];
      const distractors = [...nonAnswer.slice(0, 3), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, 2)];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '인물-사건', question: `'${person}'이(가) 참여한 사건을 모두 고르시오.`, options, answer };
    } else if (type === 'person-place') {
      const person = unit.people[Math.floor(Math.random() * unit.people.length)];
      const places = unit.connections[person]?.places || [];
      if (places.length === 0) return null;
      const k = Math.floor(Math.random() * places.length) + 1;
      const answer = places.sort(() => 0.5 - Math.random()).slice(0, k);
      const nonAnswer = unit.places.filter(p => !answer.includes(p));
      const globalNonUnit = data.units[Object.keys(data.units).find(u => u !== settings.unit)]?.places || [];
      const distractors = [...nonAnswer.slice(0, 3), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, 2)];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '인물-장소', question: `'${person}'이(가) 활동한 장소를 모두 고르시오.`, options, answer };
    } else if (type === 'event-person') {
      const event = unit.events[Math.floor(Math.random() * unit.events.length)];
      const people = unit.people.filter(p => unit.connections[p]?.events.includes(event));
      if (people.length === 0) return null;
      const k = Math.floor(Math.random() * people.length) + 1;
      const answer = people.sort(() => 0.5 - Math.random()).slice(0, k);
      const nonAnswer = unit.people.filter(p => !answer.includes(p));
      const globalNonUnit = data.allPeople.filter(p => !unit.people.includes(p));
      const distractors = [...nonAnswer.slice(0, 3), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, 2)];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '사건-인물', question: `'${event}'에 참여한 인물을 모두 고르시오.`, options, answer };
    } else if (type === 'event-place') {
      const event = unit.events[Math.floor(Math.random() * unit.events.length)];
      const peopleInEvent = unit.people.filter(p => unit.connections[p]?.events.includes(event));
      const places = [...new Set(peopleInEvent.flatMap(p => unit.connections[p]?.places || []))];
      if (places.length === 0) return null;
      const k = Math.floor(Math.random() * places.length) + 1;
      const answer = places.sort(() => 0.5 - Math.random()).slice(0, k);
      const nonAnswer = unit.places.filter(p => !answer.includes(p));
      const globalNonUnit = data.units[Object.keys(data.units).find(u => u !== settings.unit)]?.places || [];
      const distractors = [...nonAnswer.slice(0, 3), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, 2)];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '사건-장소', question: `'${event}'이(가) 일어난 장소를 모두 고르시오.`, options, answer };
    } else if (type === 'event-background') {
      const event = unit.events[Math.floor(Math.random() * unit.events.length)];
      const backgrounds = unit.eventDetails?.[event]?.background || [];
      if (backgrounds.length === 0) return null;
      const k = Math.floor(Math.random() * Math.min(3, backgrounds.length)) + 1;
      const answer = backgrounds.sort(() => 0.5 - Math.random()).slice(0, k);
      const unitAllBackgrounds = unit.events.flatMap(e => unit.eventDetails?.[e]?.background || []);
      const nonAnswer = unitAllBackgrounds.filter(b => !answer.includes(b));
      const globalNonUnit = data.allEventItems.backgrounds.filter(b => !unitAllBackgrounds.includes(b));
      const distractors = [...nonAnswer.slice(0, 3), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, 2)];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '사건 배경', question: `'${event}'의 배경에 해당하는 것을 모두 고르시오.`, options, answer };
    } else if (type === 'event-result') {
      const event = unit.events[Math.floor(Math.random() * unit.events.length)];
      const results = unit.eventDetails?.[event]?.result || [];
      if (results.length === 0) return null;
      const k = Math.floor(Math.random() * Math.min(3, results.length)) + 1;
      const answer = results.sort(() => 0.5 - Math.random()).slice(0, k);
      const unitAllResults = unit.events.flatMap(e => unit.eventDetails?.[e]?.result || []);
      const nonAnswer = unitAllResults.filter(r => !answer.includes(r));
      const globalNonUnit = data.allEventItems.results.filter(r => !unitAllResults.includes(r));
      const distractors = [...nonAnswer.slice(0, 3), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, 2)];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '사건 결과 및 의의', question: `'${event}'의 결과 및 의의에 해당하는 것을 모두 고르시오.`, options, answer };
    } else if (type === 'event-development') {
      const event = unit.events[Math.floor(Math.random() * unit.events.length)];
      const developments = unit.eventDetails?.[event]?.development || [];
      if (developments.length === 0) return null;
      const k = Math.floor(Math.random() * Math.min(3, developments.length)) + 1;
      const start = Math.floor(Math.random() * (developments.length - k + 1));
      const answer = developments.slice(start, start + k);
      const unitAllDevelopments = unit.events.flatMap(e => unit.eventDetails?.[e]?.development || []);
      const nonAnswer = unitAllDevelopments.filter(d => !answer.includes(d));
      const globalNonUnit = data.allEventItems.developments.filter(d => !unitAllDevelopments.includes(d));
      const distractors = [...nonAnswer.slice(0, 3), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, 2)];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '사건 전개', question: `'${event}'의 전개 과정 중 해당하는 것을 모두 골라 올바른 순서로 배열하시오.`, options, answer };
    }
  };

  const toggleOption = (option) => {
    if (showAnswer) return;
    setSelected(prev => 
      prev.includes(option) 
        ? prev.filter(o => o !== option) 
        : [...prev, option]
    );
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newSelected = [...selected];
    [newSelected[index - 1], newSelected[index]] = [newSelected[index], newSelected[index - 1]];
    setSelected(newSelected);
  };

  const moveDown = (index) => {
    if (index === selected.length - 1) return;
    const newSelected = [...selected];
    [newSelected[index + 1], newSelected[index]] = [newSelected[index], newSelected[index + 1]];
    setSelected(newSelected);
  };

  const submitAnswer = () => {
    const q = quiz[currentQ];
    const isOrdered = q.type === '사건 전개';
    const userAns = isOrdered ? selected : [...selected].sort();
    const correctAns = isOrdered ? q.answer : [...q.answer].sort();
    const correct = userAns.length === correctAns.length && userAns.every((v, i) => v === correctAns[i]);
    setResults([...results, correct]);
    setShowAnswer(true);
  };

  const nextQuestion = () => {
    if (currentQ < quiz.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected([]);
      setShowAnswer(false);
    } else {
      const wrongQuestions = [];
      for (let i = 0; i < quiz.length; i++) {
        if (!results[i]) {
          wrongQuestions.push(quiz[i]);
        }
      }
      if (wrongQuestions.length > 0) {
        setQuiz([...quiz, ...wrongQuestions]);
        setCurrentQ(currentQ + 1);
        setSelected([]);
        setShowAnswer(false);
      } else {
        setScreen('result');
      }
    }
  };

  const handleExitQuiz = () => {
    setShowExitModal(true);
  };

  const confirmExit = () => {
    setShowExitModal(false);
    setScreen('home');
  };

  const cancelExit = () => {
    setShowExitModal(false);
  };

  const saveUnit = (unitData) => {
    if (!unitData.key || !unitData.title) {
      alert('단원명과 제목을 입력하세요');
      return;
    }
    const newUnits = { ...data.units, [unitData.key]: { 
      title: unitData.title, 
      people: unitData.people, 
      events: unitData.events, 
      places: unitData.places, 
      connections: unitData.connections,
      eventDetails: unitData.eventDetails 
    }};
    const allPeopleSet = new Set();
    const allBgSet = new Set();
    const allDevSet = new Set();
    const allResSet = new Set();
    Object.values(newUnits).forEach(u => {
      u.people.forEach(p => allPeopleSet.add(p));
      Object.values(u.eventDetails || {}).forEach(d => {
        (d.background || []).forEach(b => allBgSet.add(b));
        (d.development || []).forEach(dev => allDevSet.add(dev));
        (d.result || []).forEach(r => allResSet.add(r));
      });
    });
    const newData = { 
      units: newUnits, 
      allPeople: Array.from(allPeopleSet), 
      allEventItems: {
        backgrounds: Array.from(allBgSet),
        developments: Array.from(allDevSet),
        results: Array.from(allResSet)
      }
    };
    setData(newData);
    if (user) {
      setDoc(doc(db, 'users', user.uid), { quizData: newData });
    }
    setEditUnit(null);
    setScreen('editor-list');
  };

  if (!user) {
    return <AuthScreen />;
  }

  if (screen === 'home') {
    return (
      <div className="max-w-md mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">📚 역사 퀴즈</h1>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
            <LogOut size={24} />
          </button>
        </div>
        <p className="text-center text-gray-600 mb-8">한국사를 재미있게 학습하세요</p>
        <button onClick={() => setScreen('settings')} className="w-full bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <BookOpen size={32} className="text-blue-600" />
            <div className="text-left">
              <h2 className="font-bold text-lg">단원별 학습</h2>
              <p className="text-sm text-gray-500">선택한 단원 집중 학습</p>
            </div>
          </div>
          <ChevronRight size={24} className="text-gray-400 group-hover:text-blue-600" />
        </button>
        <button onClick={() => setScreen('editor-list')} className="w-full bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <Edit size={32} className="text-blue-600" />
            <div className="text-left">
              <h2 className="font-bold text-lg">데이터 편집기</h2>
              <p className="text-sm text-gray-500">단원, 인물, 사건 추가/수정</p>
            </div>
          </div>
          <ChevronRight size={24} className="text-gray-400 group-hover:text-blue-600" />
        </button>
      </div>
    );
  }

  if (screen === 'editor-list') {
    return (
      <div className="max-w-md mx-auto p-6">
        <button onClick={() => setScreen('home')} className="mb-6 text-blue-600">← 뒤로</button>
        <h1 className="text-2xl font-bold mb-8">데이터 편집기</h1>
        <button onClick={() => { setEditUnit({ key: '', title: '', people: [], events: [], places: [], connections: {}, eventDetails: {} }); setScreen('editor-edit'); }} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mb-6">
          <Plus size={20} /> 새 단원
        </button>
        <div className="space-y-4">
          {Object.entries(data.units).map(([key, unit]) => (
            <div key={key} className="bg-white p-4 rounded-xl shadow flex items-center justify-between">
              <div>
                <h2 className="font-bold">{key} - {unit.title}</h2>
                <p className="text-sm text-gray-500">👤 {unit.people.length}명 · 📅 {unit.events.length}개 · 📍 {unit.places.length}개</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditUnit({ key, ...unit }); setScreen('editor-edit'); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={20} /></button>
                <button onClick={() => { 
                  // eslint-disable-next-line no-restricted-globals
                  if (confirm(`"${key}" 삭제?`)) { 
                    const newUnits = { ...data.units }; 
                    delete newUnits[key]; 
                    const allPeopleSet = new Set();
                    const allBgSet = new Set();
                    const allDevSet = new Set();
                    const allResSet = new Set();
                    Object.values(newUnits).forEach(u => {
                      u.people.forEach(p => allPeopleSet.add(p));
                      Object.values(u.eventDetails || {}).forEach(d => {
                        (d.background || []).forEach(b => allBgSet.add(b));
                        (d.development || []).forEach(dev => allDevSet.add(dev));
                        (d.result || []).forEach(r => allResSet.add(r));
                      });
                    });
                    const newData = { 
                      units: newUnits, 
                      allPeople: Array.from(allPeopleSet), 
                      allEventItems: {
                        backgrounds: Array.from(allBgSet),
                        developments: Array.from(allDevSet),
                        results: Array.from(allResSet)
                      }
                    };
                    setData(newData);
                    if (user) {
                      setDoc(doc(db, 'users', user.uid), { quizData: newData });
                    }
                  } 
                }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={20} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (screen === 'editor-edit') {
    return <UnitEditor unit={editUnit} onSave={saveUnit} onCancel={() => setScreen('editor-list')} />;
  }

  if (screen === 'settings') {
    return (
      <div className="max-w-md mx-auto p-6">
        <button onClick={() => setScreen('home')} className="mb-6 text-blue-600">← 뒤로</button>
        <h1 className="text-2xl font-bold mb-8">단원별 학습</h1>
        <h2 className="font-semibold mb-4">단원 선택</h2>
        <div className="space-y-4 mb-6">
          {Object.entries(data.units).map(([key, unit]) => (
            <div key={key} className="flex items-center gap-3 bg-white p-4 rounded-lg">
              <input type="radio" checked={settings.unit === key} onChange={e => setSettings({ ...settings, unit: key })} className="w-4 h-4" />
              {key} - {unit.title}
            </div>
          ))}
        </div>
        <h2 className="font-semibold mb-4">문제 수</h2>
        <select value={settings.questionCount} onChange={e => setSettings({ ...settings, questionCount: parseInt(e.target.value) })} className="w-full p-3 border rounded-lg mb-8">
          <option value={5}>5문제</option>
          <option value={10}>10문제</option>
          <option value={20}>20문제</option>
        </select>
        <button onClick={generateQuiz} className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold">시작하기</button>
      </div>
    );
  }

  if (screen === 'quiz' && quiz) {
    const q = quiz[currentQ];
    const isOrdered = q.type === '사건 전개';
    return (
      <>
        <div className="max-w-md mx-auto p-6">
          <div className="flex justify-between mb-4">
            <h2 className="text-sm text-gray-500">문제 {currentQ + 1}/{quiz.length}</h2>
            <button onClick={handleExitQuiz} className="text-red-600 hover:underline">나가기</button>
          </div>
          <h1 className="text-xl font-bold mb-2">{settings.unit} | {q.type}</h1>
          <p className="mb-6">{q.question}</p>
          <div className="space-y-4 mb-6">
            {q.options.map((option, idx) => {
              const isSelected = selected.includes(option);
              const isCorrect = q.answer.includes(option);
              let bg = 'bg-white', border = 'border-gray-300';
              if (showAnswer) {
                if (isCorrect) { bg = 'bg-green-50'; border = 'border-green-500'; }
                else if (isSelected) { bg = 'bg-red-50'; border = 'border-red-500'; }
              } else if (isSelected) { bg = 'bg-blue-50'; border = 'border-blue-500'; }
              return (
                <button key={idx} onClick={() => toggleOption(option)} disabled={showAnswer} className={`w-full p-4 border-2 rounded-lg text-left ${bg} ${border} ${!showAnswer && 'hover:bg-blue-50'} flex items-center justify-between`}>
                  {option}
                  {showAnswer && isCorrect && <Check className="text-green-500" size={20} />}
                  {showAnswer && !isCorrect && isSelected && <X className="text-red-500" size={20} />}
                </button>
              );
            })}
          </div>
          {isOrdered && !showAnswer && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">현재 배열 순서</h3>
              <ol className="list-decimal pl-6 space-y-2">
                {selected.map((o, i) => (
                  <li key={o} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    {o}
                    <div className="flex gap-2">
                      <button onClick={() => moveUp(i)} disabled={i === 0}><ChevronRight className="rotate-90" size={16} /></button>
                      <button onClick={() => moveDown(i)} disabled={i === selected.length - 1}><ChevronRight className="-rotate-90" size={16} /></button>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {!showAnswer ? (
            <button onClick={submitAnswer} className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold" disabled={selected.length === 0}>제출하기</button>
          ) : (
            <div className="space-y-4">
              <p className={`text-xl font-bold ${results[results.length - 1] ? 'text-green-600' : 'text-red-600'}`}>{results[results.length - 1] ? '✅ 정답!' : '❌ 오답'}</p>
              <p>정답: {isOrdered ? q.answer.join(' → ') : q.answer.join(', ')}</p>
              <button onClick={nextQuestion} className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold">{currentQ < quiz.length - 1 ? '다음 문제' : '결과 보기'}</button>
            </div>
          )}
        </div>
        {showExitModal && <ExitModal onConfirm={confirmExit} onCancel={cancelExit} />}
      </>
    );
  }

  if (screen === 'result') {
    const correctCount = results.filter(r => r).length;
    const percentage = Math.round((correctCount / results.length) * 100);
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">🎉 퀴즈 완료!</h1>
        <div className="text-6xl font-bold mb-2">{percentage}%</div>
        <p className="text-gray-600 mb-4">정답률</p>
        <p className="mb-4">맞힌 문제 {correctCount}/{results.length}</p>
        <div className="text-2xl mb-8">{'⭐'.repeat(Math.ceil(percentage / 20))}{'☆'.repeat(5 - Math.ceil(percentage / 20))}</div>
        <button onClick={() => setScreen('settings')} className="w-full bg-blue-600 text-white p-4 rounded-lg font-bold mb-4">다시 도전</button>
        <button onClick={() => setScreen('home')} className="w-full bg-gray-200 p-4 rounded-lg font-bold flex items-center justify-center gap-2">
          <Home size={20} /> 메인으로
        </button>
      </div>
    );
  }

  return null;
}

export default App;