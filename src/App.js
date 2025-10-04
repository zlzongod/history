import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Edit, ChevronRight, Check, X, Home, Plus, Trash2, Save, LogOut, RefreshCw, ChevronDown } from 'lucide-react';
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

const initialData = {
  units: {},
  allPeople: [],
  allGroups: [],
  allInstitutions: [],
  allEventItems: {
    backgrounds: [],
    developments: [],
    results: [],
    features: [],
    years: []
  },
  allGroupItems: {
    activities: []
  },
  allInstitutionItems: {
    features: []
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
  const [editData, setEditData] = useState({ ...unit, eventDetails: unit.eventDetails || {}, groupDetails: unit.groupDetails || {}, institutionDetails: unit.institutionDetails || {}, groups: unit.groups || [], institutions: unit.institutions || [] });
  const [newPerson, setNewPerson] = useState('');
  const [newEvent, setNewEvent] = useState('');
  const [newPlace, setNewPlace] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [newInstitution, setNewInstitution] = useState('');  // 새로 추가: 제도 입력
  const [newSub, setNewSub] = useState({});
  const [newActivity, setNewActivity] = useState({});
  const [newInstitutionFeature, setNewInstitutionFeature] = useState({});  // 새로 추가: 제도 특징 입력
  const [selectedPerson, setSelectedPerson] = useState('');
  const [openSections, setOpenSections] = useState({
    basic: false,
    people: false,
    events: false,
    places: false,
    groups: false,
    institutions: false,  // 새로 추가: 제도 섹션
    connections: false,
    eventDetails: false,
    groupDetails: false,
    institutionDetails: false  // 새로 추가: 제도 상세 섹션
  });
  const [openEvents, setOpenEvents] = useState({});
  const [openGroups, setOpenGroups] = useState({});
  const [openInstitutions, setOpenInstitutions] = useState({});  // 새로 추가: 제도 펼치기/접기

  useEffect(() => {
    const initialOpenEvents = {};
    editData.events.forEach(ev => {
      initialOpenEvents[ev] = false;
    });
    setOpenEvents(initialOpenEvents);

    const initialOpenGroups = {};
    editData.groups.forEach(gr => {
      initialOpenGroups[gr] = false;
    });
    setOpenGroups(initialOpenGroups);

    const initialOpenInstitutions = {};  // 새로 추가
    editData.institutions.forEach(inst => {
      initialOpenInstitutions[inst] = false;
    });
    setOpenInstitutions(initialOpenInstitutions);
  }, [editData.events, editData.groups, editData.institutions]);

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleEvent = (event) => {
    setOpenEvents(prev => ({ ...prev, [event]: !prev[event] }));
  };

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const toggleInstitution = (institution) => {  // 새로 추가
    setOpenInstitutions(prev => ({ ...prev, [institution]: !prev[institution] }));
  };

  const addPerson = () => {
    const np = newPerson.trim();
    if (!np) return;
    setEditData({
      ...editData,
      people: [...editData.people, np],
      connections: {
        ...editData.connections,
        [np]: { events: [], places: [], groups: [], institutions: [] }  // institutions 추가
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
        [ne]: { background: [], development: [], result: [], features: [], years: [] }
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

  const addGroup = () => {
    const ng = newGroup.trim();
    if (!ng) return;
    setEditData({
      ...editData,
      groups: [...editData.groups, ng],
      groupDetails: {
        ...editData.groupDetails,
        [ng]: { activities: [] }
      }
    });
    setNewGroup('');
  };

  const addInstitution = () => {  // 새로 추가: 제도 추가
    const ni = newInstitution.trim();
    if (!ni) return;
    setEditData({
      ...editData,
      institutions: [...editData.institutions, ni],
      institutionDetails: {
        ...editData.institutionDetails,
        [ni]: { features: [] }
      }
    });
    setNewInstitution('');
  };

  const addSubItem = (event, type, value) => {
    const nv = value.trim();
    if (!nv) return;
    const newDetails = { ...editData.eventDetails };
    const det = { ...newDetails[event] };
    det[type] = [...(det[type] || []), nv];
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

  const addActivityItem = (group, value) => {
    const nv = value.trim();
    if (!nv) return;
    const newDetails = { ...editData.groupDetails };
    const det = { ...newDetails[group] };
    det.activities = [...(det.activities || []), nv];
    newDetails[group] = det;
    setEditData({ ...editData, groupDetails: newDetails });
    const key = `${group}-activities`;
    setNewActivity({ ...newActivity, [key]: '' });
  };

  const removeActivityItem = (group, index) => {
    const newDetails = { ...editData.groupDetails };
    const det = { ...newDetails[group] };
    det.activities = det.activities.filter((_, i) => i !== index);
    newDetails[group] = det;
    setEditData({ ...editData, groupDetails: newDetails });
  };

  const addInstitutionFeatureItem = (institution, value) => {  // 새로 추가: 제도 특징 추가
    const nv = value.trim();
    if (!nv) return;
    const newDetails = { ...editData.institutionDetails };
    const det = { ...newDetails[institution] };
    det.features = [...(det.features || []), nv];
    newDetails[institution] = det;
    setEditData({ ...editData, institutionDetails: newDetails });
    const key = `${institution}-features`;
    setNewInstitutionFeature({ ...newInstitutionFeature, [key]: '' });
  };

  const removeInstitutionFeatureItem = (institution, index) => {  // 새로 추가: 제도 특징 제거
    const newDetails = { ...editData.institutionDetails };
    const det = { ...newDetails[institution] };
    det.features = det.features.filter((_, i) => i !== index);
    newDetails[institution] = det;
    setEditData({ ...editData, institutionDetails: newDetails });
  };

  const toggleConnection = (person, type, value) => {
    const conn = editData.connections[person] || { events: [], places: [], groups: [], institutions: [] };
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

  const removeGroup = (index, gr) => {
    const newGroups = editData.groups.filter((_, i) => i !== index);
    const newConn = { ...editData.connections };
    Object.keys(newConn).forEach(p => {
      newConn[p].groups = newConn[p].groups.filter(g => g !== gr);
    });
    const newDetails = { ...editData.groupDetails };
    delete newDetails[gr];
    setEditData({ ...editData, groups: newGroups, connections: newConn, groupDetails: newDetails });
  };

  const removeInstitution = (index, inst) => {  // 새로 추가: 제도 제거
    const newInstitutions = editData.institutions.filter((_, i) => i !== index);
    const newConn = { ...editData.connections };
    Object.keys(newConn).forEach(p => {
      newConn[p].institutions = newConn[p].institutions.filter(i => i !== inst);
    });
    const newDetails = { ...editData.institutionDetails };
    delete newDetails[inst];
    setEditData({ ...editData, institutions: newInstitutions, connections: newConn, institutionDetails: newDetails });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 rounded-xl">
      <button onClick={onCancel} className="mb-6 text-blue-600 flex items-center gap-2">← 목록으로</button>
      <h1 className="text-2xl font-bold mb-8">{unit.key ? '단원 편집' : '새 단원'}</h1>

      <div className="mb-6">
        <h2 
          className="text-xl font-semibold mb-4 flex items-center justify-between cursor-pointer sticky top-0 bg-gray-50 z-10 py-2" 
          onClick={() => toggleSection('basic')}
        >
          기본 정보
          <ChevronDown className={`transform ${openSections.basic ? 'rotate-180' : ''} transition-transform`} size={20} />
        </h2>
        {openSections.basic && (
          <>
            <label className="block mb-2 font-medium">단원명</label>
            <input value={editData.key} onChange={e => setEditData({ ...editData, key: e.target.value })} placeholder="예: 1단원" className="w-full p-3 border rounded-lg mb-4" disabled={!!unit.key} />
            <label className="block mb-2 font-medium">제목</label>
            <input value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} placeholder="예: 대한민국 임시정부" className="w-full p-3 border rounded-lg mb-6" />
          </>
        )}
      </div>

      <div className="mb-6">
        <h2 
          className="text-xl font-semibold mb-4 flex items-center justify-between cursor-pointer sticky top-0 bg-gray-50 z-10 py-2" 
          onClick={() => toggleSection('people')}
        >
          👤 인물
          <ChevronDown className={`transform ${openSections.people ? 'rotate-180' : ''} transition-transform`} size={20} />
        </h2>
        {openSections.people && (
          <>
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
          </>
        )}
      </div>

      <div className="mb-6">
        <h2 
          className="text-xl font-semibold mb-4 flex items-center justify-between cursor-pointer sticky top-0 bg-gray-50 z-10 py-2" 
          onClick={() => toggleSection('events')}
        >
          📅 사건
          <ChevronDown className={`transform ${openSections.events ? 'rotate-180' : ''} transition-transform`} size={20} />
        </h2>
        {openSections.events && (
          <>
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
          </>
        )}
      </div>

      <div className="mb-6">
        <h2 
          className="text-xl font-semibold mb-4 flex items-center justify-between cursor-pointer sticky top-0 bg-gray-50 z-10 py-2" 
          onClick={() => toggleSection('places')}
        >
          📍 장소
          <ChevronDown className={`transform ${openSections.places ? 'rotate-180' : ''} transition-transform`} size={20} />
        </h2>
        {openSections.places && (
          <>
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
          </>
        )}
      </div>

      <div className="mb-6">
        <h2 
          className="text-xl font-semibold mb-4 flex items-center justify-between cursor-pointer sticky top-0 bg-gray-50 z-10 py-2" 
          onClick={() => toggleSection('groups')}
        >
          👥 집단
          <ChevronDown className={`transform ${openSections.groups ? 'rotate-180' : ''} transition-transform`} size={20} />
        </h2>
        {openSections.groups && (
          <>
            <div className="flex gap-2 mb-4">
              <input value={newGroup} onChange={e => setNewGroup(e.target.value)} onKeyPress={e => e.key === 'Enter' && addGroup()} placeholder="집단 이름 (Enter)" className="flex-1 p-3 border rounded-lg" />
              <button onClick={addGroup} className="bg-blue-600 text-white p-3 rounded-lg"><Plus size={20} /></button>
            </div>
            <div className="space-y-2 mb-6">
              {editData.groups.map((g, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg">
                  <span>{g}</span>
                  <button onClick={() => removeGroup(i, g)} className="text-red-600"><Trash2 size={20} /></button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mb-6">  {/* 새로 추가: 제도 섹션 */}
        <h2 
          className="text-xl font-semibold mb-4 flex items-center justify-between cursor-pointer sticky top-0 bg-gray-50 z-10 py-2" 
          onClick={() => toggleSection('institutions')}
        >
          ⚖️ 제도
          <ChevronDown className={`transform ${openSections.institutions ? 'rotate-180' : ''} transition-transform`} size={20} />
        </h2>
        {openSections.institutions && (
          <>
            <div className="flex gap-2 mb-4">
              <input value={newInstitution} onChange={e => setNewInstitution(e.target.value)} onKeyPress={e => e.key === 'Enter' && addInstitution()} placeholder="제도 이름 (Enter)" className="flex-1 p-3 border rounded-lg" />
              <button onClick={addInstitution} className="bg-blue-600 text-white p-3 rounded-lg"><Plus size={20} /></button>
            </div>
            <div className="space-y-2 mb-6">
              {editData.institutions.map((inst, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg">
                  <span>{inst}</span>
                  <button onClick={() => removeInstitution(i, inst)} className="text-red-600"><Trash2 size={20} /></button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mb-6">
        <h2 
          className="text-xl font-semibold mb-4 flex items-center justify-between cursor-pointer sticky top-0 bg-gray-50 z-10 py-2" 
          onClick={() => toggleSection('connections')}
        >
          🔗 연결 관계
          <ChevronDown className={`transform ${openSections.connections ? 'rotate-180' : ''} transition-transform`} size={20} />
        </h2>
        {openSections.connections && (
          <>
            <p className="mb-4">각 인물이 참여한 사건, 활동 장소, 속한 집단, 관련 제도를 선택하세요</p>
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
                <div>
                  <h3 className="font-medium mb-2">속한 집단</h3>
                  <div className="space-y-2">
                    {editData.groups.map(gr => (
                      <div key={gr} className="flex items-center gap-2">
                        <input type="checkbox" checked={(editData.connections[selectedPerson]?.groups || []).includes(gr)} onChange={() => toggleConnection(selectedPerson, 'groups', gr)} className="w-4 h-4" />
                        {gr}
                      </div>
                    ))}
                  </div>
                </div>
                <div>  {/* 새로 추가: 관련 제도 */}
                  <h3 className="font-medium mb-2">관련 제도</h3>
                  <div className="space-y-2">
                    {editData.institutions.map(inst => (
                      <div key={inst} className="flex items-center gap-2">
                        <input type="checkbox" checked={(editData.connections[selectedPerson]?.institutions || []).includes(inst)} onChange={() => toggleConnection(selectedPerson, 'institutions', inst)} className="w-4 h-4" />
                        {inst}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mb-6">
        <h2 
          className="text-xl font-semibold mb-4 flex items-center justify-between cursor-pointer sticky top-0 bg-gray-50 z-10 py-2" 
          onClick={() => toggleSection('eventDetails')}
        >
          📋 사건 상세
          <ChevronDown className={`transform ${openSections.eventDetails ? 'rotate-180' : ''} transition-transform`} size={20} />
        </h2>
        {openSections.eventDetails && (
          <>
            {editData.events.map(event => (
              <div key={event} className="mb-6">
                <h3 
                  className="text-lg font-bold mb-4 flex items-center justify-between cursor-pointer bg-white p-4 rounded-lg"
                  onClick={() => toggleEvent(event)}
                >
                  {event}
                  <ChevronDown className={`transform ${openEvents[event] ? 'rotate-180' : ''} transition-transform`} size={20} />
                </h3>
                {openEvents[event] && (
                  <div className="bg-white p-4 rounded-lg mt-2">
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

                    <div className="mb-4">
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

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">특징</h4>
                      <div className="flex gap-2 mb-2">
                        <input
                          value={newSub[`${event}-features`] || ''}
                          onChange={e => setNewSub({ ...newSub, [`${event}-features`]: e.target.value })}
                          onKeyPress={e => e.key === 'Enter' && addSubItem(event, 'features', newSub[`${event}-features`])}
                          placeholder="특징 추가 (Enter)"
                          className="flex-1 p-3 border rounded-lg"
                        />
                        <button onClick={() => addSubItem(event, 'features', newSub[`${event}-features`])} className="bg-blue-600 text-white p-3 rounded-lg"><Plus size={20} /></button>
                      </div>
                      <div className="space-y-2">
                        {(editData.eventDetails[event]?.features || []).map((item, i) => (
                          <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span>{item}</span>
                            <button onClick={() => removeSubItem(event, 'features', i)} className="text-red-600"><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium mb-2">연도</h4>
                      <div className="flex gap-2 mb-2">
                        <input
                          value={newSub[`${event}-years`] || ''}
                          onChange={e => setNewSub({ ...newSub, [`${event}-years`]: e.target.value })}
                          onKeyPress={e => e.key === 'Enter' && addSubItem(event, 'years', newSub[`${event}-years`])}
                          placeholder="연도 추가 (Enter)"
                          className="flex-1 p-3 border rounded-lg"
                        />
                        <button onClick={() => addSubItem(event, 'years', newSub[`${event}-years`])} className="bg-blue-600 text-white p-3 rounded-lg"><Plus size={20} /></button>
                      </div>
                      <div className="space-y-2">
                        {(editData.eventDetails[event]?.years || []).map((item, i) => (
                          <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span>{item}</span>
                            <button onClick={() => removeSubItem(event, 'years', i)} className="text-red-600"><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      <div className="mb-6">
        <h2 
          className="text-xl font-semibold mb-4 flex items-center justify-between cursor-pointer sticky top-0 bg-gray-50 z-10 py-2" 
          onClick={() => toggleSection('groupDetails')}
        >
          👥 집단 상세
          <ChevronDown className={`transform ${openSections.groupDetails ? 'rotate-180' : ''} transition-transform`} size={20} />
        </h2>
        {openSections.groupDetails && (
          <>
            {editData.groups.map(group => (
              <div key={group} className="mb-6">
                <h3 
                  className="text-lg font-bold mb-4 flex items-center justify-between cursor-pointer bg-white p-4 rounded-lg"
                  onClick={() => toggleGroup(group)}
                >
                  {group}
                  <ChevronDown className={`transform ${openGroups[group] ? 'rotate-180' : ''} transition-transform`} size={20} />
                </h3>
                {openGroups[group] && (
                  <div className="bg-white p-4 rounded-lg mt-2">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">활동</h4>
                      <div className="flex gap-2 mb-2">
                        <input
                          value={newActivity[`${group}-activities`] || ''}
                          onChange={e => setNewActivity({ ...newActivity, [`${group}-activities`]: e.target.value })}
                          onKeyPress={e => e.key === 'Enter' && addActivityItem(group, newActivity[`${group}-activities`])}
                          placeholder="활동 추가 (Enter)"
                          className="flex-1 p-3 border rounded-lg"
                        />
                        <button onClick={() => addActivityItem(group, newActivity[`${group}-activities`])} className="bg-blue-600 text-white p-3 rounded-lg"><Plus size={20} /></button>
                      </div>
                      <div className="space-y-2">
                        {(editData.groupDetails[group]?.activities || []).map((item, i) => (
                          <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span>{item}</span>
                            <button onClick={() => removeActivityItem(group, i)} className="text-red-600"><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      <div className="mb-6">  {/* 새로 추가: 제도 상세 섹션 */}
        <h2 
          className="text-xl font-semibold mb-4 flex items-center justify-between cursor-pointer sticky top-0 bg-gray-50 z-10 py-2" 
          onClick={() => toggleSection('institutionDetails')}
        >
          ⚖️ 제도 상세
          <ChevronDown className={`transform ${openSections.institutionDetails ? 'rotate-180' : ''} transition-transform`} size={20} />
        </h2>
        {openSections.institutionDetails && (
          <>
            {editData.institutions.map(institution => (
              <div key={institution} className="mb-6">
                <h3 
                  className="text-lg font-bold mb-4 flex items-center justify-between cursor-pointer bg-white p-4 rounded-lg"
                  onClick={() => toggleInstitution(institution)}
                >
                  {institution}
                  <ChevronDown className={`transform ${openInstitutions[institution] ? 'rotate-180' : ''} transition-transform`} size={20} />
                </h3>
                {openInstitutions[institution] && (
                  <div className="bg-white p-4 rounded-lg mt-2">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">특징</h4>
                      <div className="flex gap-2 mb-2">
                        <input
                          value={newInstitutionFeature[`${institution}-features`] || ''}
                          onChange={e => setNewInstitutionFeature({ ...newInstitutionFeature, [`${institution}-features`]: e.target.value })}
                          onKeyPress={e => e.key === 'Enter' && addInstitutionFeatureItem(institution, newInstitutionFeature[`${institution}-features`])}
                          placeholder="특징 추가 (Enter)"
                          className="flex-1 p-3 border rounded-lg"
                        />
                        <button onClick={() => addInstitutionFeatureItem(institution, newInstitutionFeature[`${institution}-features`])} className="bg-blue-600 text-white p-3 rounded-lg"><Plus size={20} /></button>
                      </div>
                      <div className="space-y-2">
                        {(editData.institutionDetails[institution]?.features || []).map((item, i) => (
                          <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span>{item}</span>
                            <button onClick={() => removeInstitutionFeatureItem(institution, i)} className="text-red-600"><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>

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
  const [data, setData] = useState(initialData);
  const [screen, setScreen] = useState('home');
  const [editUnit, setEditUnit] = useState(null);
  const [settings, setSettings] = useState({ unit: '1단원', questionCount: 10 });
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [results, setResults] = useState([]);
  const [generatedQuestions, setGeneratedQuestions] = useState(new Set());
  const [showExitModal, setShowExitModal] = useState(false);
  const [correctCounts, setCorrectCounts] = useState({});
  const [wrongQuestions, setWrongQuestions] = useState([]);
  const isFetchingRef = useRef(false);  // 추가

  useEffect(() => {
    console.log('Auth state change triggered');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log('User logged in, fetching data from Firestore');
        isFetchingRef.current = true;  // fetch 시작
        const userDocRef = doc(db, 'users', currentUser.uid);
        getDoc(userDocRef).then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            console.log('Fetched data from Firestore:', userData.quizData);
            setData(userData.quizData || initialData);
            setCorrectCounts(userData.userProgress?.correctCounts || {});
            setWrongQuestions(userData.userProgress?.wrongQuestions || []);
          } else {
            console.log('No data in Firestore, initializing with empty data');
            setDoc(userDocRef, { quizData: initialData, userProgress: { correctCounts: {}, wrongQuestions: [] } });
            setData(initialData);
            setCorrectCounts({});
            setWrongQuestions([]);
          }
          // fetch 완료 후 플래그 해제
          setTimeout(() => {
            isFetchingRef.current = false;
          }, 100);
        }).catch((error) => {
          console.error("Error fetching user data:", error);
          isFetchingRef.current = false;
        });
      } else {
        console.log('User logged out, resetting to initialData');
        setData(initialData);
        setCorrectCounts({});
        setWrongQuestions([]);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    // fetch 중이면 저장하지 않음
    if (user && !isFetchingRef.current) {
      console.log('Saving data to Firestore:', data);
      const userDocRef = doc(db, 'users', user.uid);
      setDoc(userDocRef, {
        quizData: data,
        userProgress: { correctCounts, wrongQuestions }
      }, { merge: true }).then(() => {
        console.log('Successfully saved to Firestore');
      }).catch((error) => {
        console.error("Error saving to Firebase:", error);
      });
    }
  }, [data, correctCounts, wrongQuestions, user]);

  const handleLogout = () => {
    signOut(auth);
    setCorrectCounts({});
    setWrongQuestions([]);
  };

  const getQuestionKey = (q) => {
    return `${q.type}|${q.question}|${q.options.sort().join(',')}`;
  };

  const isQuestionUnique = (q) => {
    const questionKey = getQuestionKey(q);
    return !generatedQuestions.has(questionKey);
  };

  const generateQuiz = () => {
    const unit = data.units[settings.unit];
    const questions = [];
    const typeWeights = {
      'person-event': 1,
      'person-place': 1,
      'person-group': 1,
      'event-person': 1.2,
      'event-place': 1.2,
      'group-person': 1.2,
      'group-activity': 1.5,
      'event-background': 1.5,
      'event-development': 2,
      'event-result': 1.5,
      'event-features': 1.5,
      'event-year': 1,
      'institution-features': 2,
      'person-institution': 1.8
    };
    const totalWeight = Object.values(typeWeights).reduce((a, b) => a + b, 0);
    const newGenerated = new Set();

    while (questions.length < settings.questionCount) {
      const rand = Math.random() * totalWeight;
      let cumulative = 0;
      let selectedType = null;
      for (const type in typeWeights) {
        cumulative += typeWeights[type];
        if (rand <= cumulative) {
          selectedType = type;
          break;
        }
      }
      const q = generateQuestion(selectedType, unit, data);
      if (q) {
        const questionKey = getQuestionKey(q);
        if (correctCounts[questionKey] >= 4) continue;
        if (isQuestionUnique(q)) {
          questions.push(q);
          newGenerated.add(questionKey);
        }
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

  const generateWrongQuiz = () => {
    if (wrongQuestions.length === 0) return;
    const shuffled = [...wrongQuestions].sort(() => Math.random() - 0.5);
    setQuiz(shuffled);
    setGeneratedQuestions(new Set(shuffled.map(getQuestionKey)));
    setCurrentQ(0);
    setSelected([]);
    setShowAnswer(false);
    setResults([]);
    setScreen('quiz');
  };

  const generateQuestion = (type, unit, data) => {
    const distractorCount = Math.floor(Math.random() * 3) + 7;
    if (type === 'person-event') {
      const person = unit.people[Math.floor(Math.random() * unit.people.length)];
      const events = unit.connections[person]?.events || [];
      if (events.length === 0) return null;
      const k = Math.floor(Math.random() * events.length) + 1;
      const answer = events.sort(() => 0.5 - Math.random()).slice(0, k);
      const nonAnswer = unit.events.filter(e => !answer.includes(e));
      const globalNonUnit = Object.values(data.units).flatMap(u => u.events || []).filter(e => !unit.events.includes(e));
      const distractors = [...nonAnswer.sort(() => 0.5 - Math.random()).slice(0, Math.floor(distractorCount / 2)), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, distractorCount - Math.floor(distractorCount / 2))];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '인물-사건', question: `'${person}'이(가) 참여한 사건을 모두 고르시오.`, options, answer };
    } else if (type === 'person-place') {
      const person = unit.people[Math.floor(Math.random() * unit.people.length)];
      const places = unit.connections[person]?.places || [];
      if (places.length === 0) return null;
      const k = Math.floor(Math.random() * places.length) + 1;
      const answer = places.sort(() => 0.5 - Math.random()).slice(0, k);
      const nonAnswer = unit.places.filter(p => !answer.includes(p));
      const globalNonUnit = Object.values(data.units).flatMap(u => u.places || []).filter(p => !unit.places.includes(p));
      const distractors = [...nonAnswer.sort(() => 0.5 - Math.random()).slice(0, Math.floor(distractorCount / 2)), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, distractorCount - Math.floor(distractorCount / 2))];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '인물-장소', question: `'${person}'이(가) 활동한 장소를 모두 고르시오.`, options, answer };
    } else if (type === 'person-group') {
      const person = unit.people[Math.floor(Math.random() * unit.people.length)];
      const groups = unit.connections[person]?.groups || [];
      if (groups.length === 0) return null;
      const k = Math.floor(Math.random() * groups.length) + 1;
      const answer = groups.sort(() => 0.5 - Math.random()).slice(0, k);
      const nonAnswer = unit.groups.filter(g => !answer.includes(g));
      const globalNonUnit = data.allGroups.filter(g => !unit.groups.includes(g));
      const distractors = [...nonAnswer.sort(() => 0.5 - Math.random()).slice(0, Math.floor(distractorCount / 2)), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, distractorCount - Math.floor(distractorCount / 2))];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '인물-집단', question: `'${person}'이(가) 속한 집단을 모두 고르시오.`, options, answer };
    } else if (type === 'event-person') {
      const event = unit.events[Math.floor(Math.random() * unit.events.length)];
      const people = unit.people.filter(p => unit.connections[p]?.events.includes(event));
      if (people.length === 0) return null;
      const k = Math.floor(Math.random() * people.length) + 1;
      const answer = people.sort(() => 0.5 - Math.random()).slice(0, k);
      const nonAnswer = unit.people.filter(p => !answer.includes(p));
      const globalNonUnit = data.allPeople.filter(p => !unit.people.includes(p));
      const distractors = [...nonAnswer.sort(() => 0.5 - Math.random()).slice(0, Math.floor(distractorCount / 2)), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, distractorCount - Math.floor(distractorCount / 2))];
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
      const globalNonUnit = Object.values(data.units).flatMap(u => u.places || []).filter(p => !unit.places.includes(p));
      const distractors = [...nonAnswer.sort(() => 0.5 - Math.random()).slice(0, Math.floor(distractorCount / 2)), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, distractorCount - Math.floor(distractorCount / 2))];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '사건-장소', question: `'${event}'이(가) 일어난 장소를 모두 고르시오.`, options, answer };
    } else if (type === 'group-person') {
      const group = unit.groups[Math.floor(Math.random() * unit.groups.length)];
      const people = unit.people.filter(p => unit.connections[p]?.groups.includes(group));
      if (people.length === 0) return null;
      const k = Math.floor(Math.random() * people.length) + 1;
      const answer = people.sort(() => 0.5 - Math.random()).slice(0, k);
      const nonAnswer = unit.people.filter(p => !answer.includes(p));
      const globalNonUnit = data.allPeople.filter(p => !unit.people.includes(p));
      const distractors = [...nonAnswer.sort(() => 0.5 - Math.random()).slice(0, Math.floor(distractorCount / 2)), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, distractorCount - Math.floor(distractorCount / 2))];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '집단-인물', question: `'${group}'에 속한 인물을 모두 고르시오.`, options, answer };
    } else if (type === 'group-activity') {
      const group = unit.groups[Math.floor(Math.random() * unit.groups.length)];
      const activities = unit.groupDetails?.[group]?.activities || [];
      if (activities.length === 0) return null;
      const k = Math.floor(Math.random() * Math.min(3, activities.length)) + 1;
      const answer = activities.sort(() => 0.5 - Math.random()).slice(0, k);
      const unitAllActivities = unit.groups.flatMap(g => unit.groupDetails?.[g]?.activities || []);
      const nonAnswer = unitAllActivities.filter(a => !answer.includes(a));
      const globalNonUnit = data.allGroupItems.activities.filter(a => !unitAllActivities.includes(a));
      const distractors = [...nonAnswer.sort(() => 0.5 - Math.random()).slice(0, Math.floor(distractorCount / 2)), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, distractorCount - Math.floor(distractorCount / 2))];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '집단 활동', question: `'${group}'의 활동에 해당하는 것을 모두 고르시오.`, options, answer };
    } else if (type === 'event-background') {
      const event = unit.events[Math.floor(Math.random() * unit.events.length)];
      const backgrounds = unit.eventDetails?.[event]?.background || [];
      if (backgrounds.length === 0) return null;
      const k = Math.floor(Math.random() * Math.min(3, backgrounds.length)) + 1;
      const answer = backgrounds.sort(() => 0.5 - Math.random()).slice(0, k);
      const unitAllBackgrounds = unit.events.flatMap(e => unit.eventDetails?.[e]?.background || []);
      const nonAnswer = unitAllBackgrounds.filter(b => !answer.includes(b));
      const globalNonUnit = data.allEventItems.backgrounds.filter(b => !unitAllBackgrounds.includes(b));
      const distractors = [...nonAnswer.sort(() => 0.5 - Math.random()).slice(0, Math.floor(distractorCount / 2)), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, distractorCount - Math.floor(distractorCount / 2))];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '사건 배경', question: `'${event}'의 배경에 해당하는 것을 모두 고르시오.`, options, answer };
    } else if (type === 'event-development') {
      const event = unit.events[Math.floor(Math.random() * unit.events.length)];
      const developments = unit.eventDetails?.[event]?.development || [];
      if (developments.length < 3) return null;
      const k = Math.min(3, developments.length);
      const start = Math.floor(Math.random() * (developments.length - k + 1));
      const answer = developments.slice(start, start + k);
      const unitAllDevelopments = unit.events.flatMap(e => unit.eventDetails?.[e]?.development || []);
      const nonAnswer = unitAllDevelopments.filter(d => !answer.includes(d));
      const globalNonUnit = data.allEventItems.developments.filter(d => !unitAllDevelopments.includes(d));
      const distractors = [...nonAnswer.sort(() => 0.5 - Math.random()).slice(0, Math.floor(distractorCount / 2)), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, distractorCount - Math.floor(distractorCount / 2))];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '사건 전개', question: `'${event}'의 전개 과정 중 해당하는 것을 모두 골라 올바른 시간 순서대로 배열하시오. (배열 순서가 중요합니다. 위에서 아래로 과거부터 미래 순.)`, options, answer };
    } else if (type === 'event-result') {
      const event = unit.events[Math.floor(Math.random() * unit.events.length)];
      const results = unit.eventDetails?.[event]?.result || [];
      if (results.length === 0) return null;
      const k = Math.floor(Math.random() * Math.min(3, results.length)) + 1;
      const answer = results.sort(() => 0.5 - Math.random()).slice(0, k);
      const unitAllResults = unit.events.flatMap(e => unit.eventDetails?.[e]?.result || []);
      const nonAnswer = unitAllResults.filter(r => !answer.includes(r));
      const globalNonUnit = data.allEventItems.results.filter(r => !unitAllResults.includes(r));
      const distractors = [...nonAnswer.sort(() => 0.5 - Math.random()).slice(0, Math.floor(distractorCount / 2)), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, distractorCount - Math.floor(distractorCount / 2))];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '사건 결과 및 의의', question: `'${event}'의 결과 및 의의에 해당하는 것을 모두 고르시오.`, options, answer };
    } else if (type === 'event-features') {
      const event = unit.events[Math.floor(Math.random() * unit.events.length)];
      const features = unit.eventDetails?.[event]?.features || [];
      if (features.length === 0) return null;
      const k = Math.floor(Math.random() * Math.min(3, features.length)) + 1;
      const answer = features.sort(() => 0.5 - Math.random()).slice(0, k);
      const unitAllFeatures = unit.events.flatMap(e => unit.eventDetails?.[e]?.features || []);
      const nonAnswer = unitAllFeatures.filter(f => !answer.includes(f));
      const globalNonUnit = data.allEventItems.features.filter(f => !unitAllFeatures.includes(f));
      const distractors = [...nonAnswer.sort(() => 0.5 - Math.random()).slice(0, Math.floor(distractorCount / 2)), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, distractorCount - Math.floor(distractorCount / 2))];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '사건 특징', question: `'${event}'의 특징으로 올바른 것을 모두 고르시오.`, options, answer };
    } else if (type === 'event-year') {
      const event = unit.events[Math.floor(Math.random() * unit.events.length)];
      const years = unit.eventDetails?.[event]?.years || [];
      if (years.length === 0) return null;
      const k = Math.floor(Math.random() * years.length) + 1;
      const answer = years.sort(() => 0.5 - Math.random()).slice(0, k);
      const unitAllYears = unit.events.flatMap(e => unit.eventDetails?.[e]?.years || []);
      const nonAnswer = unitAllYears.filter(y => !answer.includes(y));
      const globalNonUnit = data.allEventItems.years.filter(y => !unitAllYears.includes(y));
      const distractors = [...nonAnswer.sort(() => 0.5 - Math.random()).slice(0, Math.floor(distractorCount / 2)), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, distractorCount - Math.floor(distractorCount / 2))];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '사건 연도', question: `'${event}'이 발생한 연도를 모두 고르시오.`, options, answer };
    } else if (type === 'institution-features') {
      const institution = unit.institutions[Math.floor(Math.random() * unit.institutions.length)];
      const features = unit.institutionDetails?.[institution]?.features || [];
      if (features.length === 0) return null;
      const k = Math.floor(Math.random() * Math.min(3, features.length)) + 1;
      const answer = features.sort(() => 0.5 - Math.random()).slice(0, k);
      const unitAllFeatures = unit.institutions.flatMap(i => unit.institutionDetails?.[i]?.features || []);
      const nonAnswer = unitAllFeatures.filter(f => !answer.includes(f));
      const globalNonUnit = data.allInstitutionItems.features.filter(f => !unitAllFeatures.includes(f));
      const distractors = [...nonAnswer.sort(() => 0.5 - Math.random()).slice(0, Math.floor(distractorCount / 2)), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, distractorCount - Math.floor(distractorCount / 2))];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '제도 특징', question: `'${institution}'의 특징으로 올바른 것을 모두 고르시오.`, options, answer };
    } else if (type === 'person-institution') {
      const person = unit.people[Math.floor(Math.random() * unit.people.length)];
      const institutions = unit.connections[person]?.institutions || [];
      if (institutions.length === 0) return null;
      const k = Math.floor(Math.random() * institutions.length) + 1;
      const answer = institutions.sort(() => 0.5 - Math.random()).slice(0, k);
      const nonAnswer = unit.institutions.filter(i => !answer.includes(i));
      const globalNonUnit = data.allInstitutions.filter(i => !unit.institutions.includes(i));
      const distractors = [...nonAnswer.sort(() => 0.5 - Math.random()).slice(0, Math.floor(distractorCount / 2)), ...globalNonUnit.sort(() => 0.5 - Math.random()).slice(0, distractorCount - Math.floor(distractorCount / 2))];
      const options = [...answer, ...distractors].sort(() => 0.5 - Math.random());
      return { type: '인물-제도', question: `'${person}'이(가) 관련된 제도를 모두 고르시오.`, options, answer };
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

    const questionKey = getQuestionKey(q);
    if (correct) {
      const newCount = (correctCounts[questionKey] || 0) + 1;
      setCorrectCounts(prev => ({ ...prev, [questionKey]: newCount }));
      if (wrongQuestions.some(wq => getQuestionKey(wq) === questionKey)) {
        setWrongQuestions(prev => prev.filter(wq => getQuestionKey(wq) !== questionKey));
      }
    } else {
      if (!wrongQuestions.some(wq => getQuestionKey(wq) === questionKey)) {
        setWrongQuestions(prev => [...prev, q]);
      }
    }
  };

  const nextQuestion = () => {
    if (currentQ < quiz.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected([]);
      setShowAnswer(false);
    } else {
      setScreen('result');
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
      groups: unitData.groups,
      institutions: unitData.institutions,
      connections: unitData.connections,
      eventDetails: unitData.eventDetails,
      groupDetails: unitData.groupDetails,
      institutionDetails: unitData.institutionDetails
    }};
    const allPeopleSet = new Set();
    const allGroupsSet = new Set();
    const allInstitutionsSet = new Set();
    const allBgSet = new Set();
    const allDevSet = new Set();
    const allResSet = new Set();
    const allFeatSet = new Set();
    const allYearsSet = new Set();
    const allActSet = new Set();
    const allInstFeatSet = new Set();
    Object.values(newUnits).forEach(u => {
      u.people.forEach(p => allPeopleSet.add(p));
      u.groups.forEach(g => allGroupsSet.add(g));
      u.institutions.forEach(i => allInstitutionsSet.add(i));
      Object.values(u.eventDetails || {}).forEach(d => {
        (d.background || []).forEach(b => allBgSet.add(b));
        (d.development || []).forEach(dev => allDevSet.add(dev));
        (d.result || []).forEach(r => allResSet.add(r));
        (d.features || []).forEach(f => allFeatSet.add(f));
        (d.years || []).forEach(y => allYearsSet.add(y));
      });
      Object.values(u.groupDetails || {}).forEach(d => {
        (d.activities || []).forEach(a => allActSet.add(a));
      });
      Object.values(u.institutionDetails || {}).forEach(d => {
        (d.features || []).forEach(f => allInstFeatSet.add(f));
      });
    });
    const newData = { 
      units: newUnits, 
      allPeople: Array.from(allPeopleSet), 
      allGroups: Array.from(allGroupsSet),
      allInstitutions: Array.from(allInstitutionsSet),
      allEventItems: {
        backgrounds: Array.from(allBgSet),
        developments: Array.from(allDevSet),
        results: Array.from(allResSet),
        features: Array.from(allFeatSet),
        years: Array.from(allYearsSet)
      },
      allGroupItems: {
        activities: Array.from(allActSet)
      },
      allInstitutionItems: {
        features: Array.from(allInstFeatSet)
      }
    };
    setData(newData);
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
        <p className="text-sm text-gray-500 text-center">4번 맞춘 문제는 더 이상 등장하지 않습니다.</p>
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
        {wrongQuestions.length > 0 && (
          <button onClick={generateWrongQuiz} className="w-full bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-between group">
            <div className="flex items-center gap-4">
              <RefreshCw size={32} className="text-green-600" />
              <div className="text-left">
                <h2 className="font-bold text-lg">틀린 문제 연습</h2>
                <p className="text-sm text-gray-500">{wrongQuestions.length} 문제</p>
              </div>
            </div>
            <ChevronRight size={24} className="text-gray-400 group-hover:text-green-600" />
          </button>
        )}
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
        <button onClick={() => { setEditUnit({ key: '', title: '', people: [], events: [], places: [], groups: [], institutions: [], connections: {}, eventDetails: {}, groupDetails: {}, institutionDetails: {} }); setScreen('editor-edit'); }} className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mb-6">
          <Plus size={20} /> 새 단원
        </button>
        <div className="space-y-4">
          {Object.entries(data.units).map(([key, unit]) => (
            <div key={key} className="bg-white p-4 rounded-xl shadow flex items-center justify-between">
              <div>
                <h2 className="font-bold">{key} - {unit.title}</h2>
                <p className="text-sm text-gray-500">👤 {unit.people.length}명 · 📅 {unit.events.length}개 · 📍 {unit.places.length}개 · 👥 {unit.groups.length}개 · ⚖️ {unit.institutions.length}개</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditUnit({ key, ...unit }); setScreen('editor-edit'); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={20} /></button>
                <button onClick={() => { 
                  if (window.confirm(`"${key}" 삭제?`)) { 
                    const newUnits = { ...data.units }; 
                    delete newUnits[key]; 
                    const allPeopleSet = new Set();
                    const allGroupsSet = new Set();
                    const allInstitutionsSet = new Set();
                    const allBgSet = new Set();
                    const allDevSet = new Set();
                    const allResSet = new Set();
                    const allFeatSet = new Set();
                    const allYearsSet = new Set();
                    const allActSet = new Set();
                    const allInstFeatSet = new Set();
                    Object.values(newUnits).forEach(u => {
                      u.people.forEach(p => allPeopleSet.add(p));
                      u.groups.forEach(g => allGroupsSet.add(g));
                      u.institutions.forEach(i => allInstitutionsSet.add(i));
                      Object.values(u.eventDetails || {}).forEach(d => {
                        (d.background || []).forEach(b => allBgSet.add(b));
                        (d.development || []).forEach(dev => allDevSet.add(dev));
                        (d.result || []).forEach(r => allResSet.add(r));
                        (d.features || []).forEach(f => allFeatSet.add(f));
                        (d.years || []).forEach(y => allYearsSet.add(y));
                      });
                      Object.values(u.groupDetails || {}).forEach(d => {
                        (d.activities || []).forEach(a => allActSet.add(a));
                      });
                      Object.values(u.institutionDetails || {}).forEach(d => {
                        (d.features || []).forEach(f => allInstFeatSet.add(f));
                      });
                    });
                    const newData = { 
                      units: newUnits, 
                      allPeople: Array.from(allPeopleSet), 
                      allGroups: Array.from(allGroupsSet),
                      allInstitutions: Array.from(allInstitutionsSet),
                      allEventItems: {
                        backgrounds: Array.from(allBgSet),
                        developments: Array.from(allDevSet),
                        results: Array.from(allResSet),
                        features: Array.from(allFeatSet),
                        years: Array.from(allYearsSet)
                      },
                      allGroupItems: {
                        activities: Array.from(allActSet)
                      },
                      allInstitutionItems: {
                        features: Array.from(allInstFeatSet)
                      }
                    };
                    setData(newData);
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
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
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
              <h3 className="font-semibold mb-2">현재 배열 순서 (과거부터 미래 순으로 배열하세요)</h3>
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