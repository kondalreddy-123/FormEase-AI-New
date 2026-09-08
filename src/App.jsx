import React,{useEffect,useMemo,useState} from 'react';
import {ArrowLeft,ArrowRight,AlertTriangle,Accessibility,BarChart3,Bot,Camera,Check,CheckCircle2,CircleHelp,Clock,CloudOff,Copy,Download,FileText,HelpCircle,History,Home as HomeIcon,Languages,Menu,MessageCircle,Mic,RefreshCw,Save,Share2,ShieldCheck,Sparkles,ThumbsDown,ThumbsUp,Upload,UserPlus,Volume2,X} from 'lucide-react';
import {
  checkForm,
  explainField,
  understandRequest,
  getService,
  listServices
} from './aiService';
import {createWorker} from 'tesseract.js';
import {jsPDF} from 'jspdf';

const STEPS=['Need','Service','Documents','Form','AI Check','Review'];
const LANGS={English:{code:'en-IN',home:'Government services, made simple',need:'What do you need help with?',continue:'Continue',back:'Back',understand:'Understand my need',documents:'Documents',form:'Guided form'},Telugu:{code:'te-IN',home:'ప్రభుత్వ సేవలను సులభంగా పొందండి',need:'మీకు ఏ సేవ కావాలి?',continue:'కొనసాగించండి',back:'వెనుకకు',understand:'నా అవసరాన్ని అర్థం చేసుకోండి',documents:'పత్రాలు',form:'ఫారమ్'},Hindi:{code:'hi-IN',home:'सरकारी सेवाएं आसान बनाएं',need:'आपको किस सेवा में मदद चाहिए?',continue:'आगे बढ़ें',back:'वापस',understand:'मेरी जरूरत समझें',documents:'दस्तावेज',form:'फॉर्म'},Marathi:{code:'mr-IN',home:'सरकारी सेवा सोप्या पद्धतीने',need:'तुम्हाला कोणत्या सेवेसाठी मदत हवी?',continue:'पुढे जा',back:'मागे',understand:'माझी गरज समजा',documents:'कागदपत्रे',form:'फॉर्म'},Tamil:{code:'ta-IN',home:'அரசு சேவைகள் எளிமையாக',need:'உங்களுக்கு எந்த சேவையில் உதவி வேண்டும்?',continue:'தொடர்க',back:'பின்செல்',understand:'என் தேவையை புரிந்துகொள்',documents:'ஆவணங்கள்',form:'படிவம்'},Kannada:{code:'kn-IN',home:'ಸರ್ಕಾರಿ ಸೇವೆಗಳು ಸುಲಭವಾಗಿ',need:'ನಿಮಗೆ ಯಾವ ಸೇವೆಯಲ್ಲಿ ಸಹಾಯ ಬೇಕು?',continue:'ಮುಂದುವರಿಸಿ',understand:'ನನ್ನ ಅಗತ್ಯವನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ',documents:'ದಾಖಲೆಗಳು',form:'ಫಾರ್ಮ್'}};
const demo={name:'Ravi Kumar',dob:'2008-08-15',age:'',mobile:'9876543210',occupation:'Student',income:'25000',incomeFrequency:'Monthly',purpose:'Education'};
const initialDocs={identity:null,address:null,incomeProof:null,photo:null};
const faq=['What documents are needed?','Can I apply if my income changed recently?','How long does processing usually take?','What should I do if a certificate has expired?'];
const DEADLINES={'Post-Matric Scholarship':'2026-09-20','College / University Scholarship':'2026-10-15','Old Age Pension':'2026-12-31','Income Certificate':'2026-12-31','Caste Certificate':'2026-12-31'};
const SERVICES=[['Post-Matric Scholarship','🎓','Education financial assistance'],['College / University Scholarship','📚','Higher-education scholarship guidance'],['Old Age Pension','👴','Senior citizen pension guidance'],['Widow Pension','👩','Pension and support guidance'],['Income Certificate','💰','Income proof application guidance'],['Caste Certificate','📄','Certificate application guidance'],['Residence Certificate','🏠','Proof-of-residence guidance'],['Farmer Services','🌾','Farmer welfare services'],['Government Jobs','💼','Employment and recruitment services'],['Health Schemes','🏥','Health scheme guidance'],['Ration Card Services','🍚','Food and ration services'],['Government Grievance','📝','Raise and track grievances']];

function App(){
 const [screen,setScreen]=useState('home'),[request,setRequest]=useState(''),[understanding,setUnderstanding]=useState(null),[service,setService]=useState(null),[form,setForm]=useState(demo),[docs,setDocs]=useState(initialDocs),[docFiles,setDocFiles]=useState({}),[issues,setIssues]=useState([]),[checked,setChecked]=useState(false),[language,setLanguage]=useState('English'),[mobileMenu,setMobileMenu]=useState(false),[loading,setLoading]=useState(false),[appId,setAppId]=useState(''),[banner,setBanner]=useState(true),[online,setOnline]=useState(navigator.onLine),[profiles,setProfiles]=useState([{id:'self',name:'Ravi Kumar',relation:'Self'}]),[activeProfile,setActiveProfile]=useState('self'),[reminders,setReminders]=useState([]),[syncCode,setSyncCode]=useState(''),[showHelper,setShowHelper]=useState(false),[eligibility,setEligibility]=useState(null),[expiry,setExpiry]=useState({}),[aiFilled,setAiFilled]=useState({}),[lastSaved,setLastSaved]=useState(null),[applications,setApplications]=useState([]),[duplicate,setDuplicate]=useState(null),[dark,setDark]=useState(false),[largeText,setLargeText]=useState(false),[feedback,setFeedback]=useState({}),[cameraMode,setCameraMode]=useState(false);
 const t=LANGS[language];
 const saveTime=()=>{const now=new Date();setLastSaved(now);localStorage.setItem('formease-last-saved',now.toISOString())};
 useEffect(()=>{const ls=localStorage.getItem('formease-last-saved');if(ls)setLastSaved(new Date(ls));const ah=localStorage.getItem('formease-applications');if(ah)try{setApplications(JSON.parse(ah))}catch{}const rh=localStorage.getItem('formease-reminders');if(rh)try{setReminders(JSON.parse(rh))}catch{}},[]);
 useEffect(()=>{document.documentElement.classList.toggle('dark-mode',dark);document.documentElement.classList.toggle('large-text',largeText)},[dark,largeText]);
 useEffect(()=>{const id=setTimeout(()=>saveTime(),700);return()=>clearTimeout(id)},[form,docs,service,screen,activeProfile,expiry]);
 const relativeSaved=lastSaved?Math.max(0,Math.floor((Date.now()-lastSaved.getTime())/60000))+' min ago':'Not saved yet';
 const daysLeft=service&&DEADLINES[service]?Math.max(0,Math.ceil((new Date(DEADLINES[service])-new Date())/86400000)):null;
 const duplicateCheck=name=>{const matches=applications.filter(a=>a.service===name&&a.status!=='Rejected'&&a.status!=='Completed');return matches.length?matches[0]:null};
 const shareChecklist=async()=>{const text=`FormEase AI checklist\nService: ${service}\nApplicant: ${form.name||'Applicant'}\nDocuments: ${docsFor.map(k=>({identity:'Identity proof',address:'Address proof',incomeProof:'Income proof',photo:'Passport photo'}[k])).join(', ')}`;if(navigator.share)await navigator.share({title:'FormEase checklist',text});else{await navigator.clipboard?.writeText(text);alert('Checklist copied. You can send it to a family member.')}};
 const exportHistory=()=>{const blob=new Blob([JSON.stringify(applications,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='FormEase-application-history.json';a.click();URL.revokeObjectURL(a.href)};
 useEffect(()=>{const on=()=>setOnline(true),off=()=>setOnline(false);addEventListener('online',on);addEventListener('offline',off);const saved=localStorage.getItem('formease-progress');if(saved){try{const s=JSON.parse(saved);if(s.form)setForm(s.form);if(s.docs)setDocs(s.docs);if(s.service){setService(s.service);setUnderstanding({service:s.service,...getService(s.service)})}}catch{}} return()=>{removeEventListener('online',on);removeEventListener('offline',off)}},[]);
 useEffect(()=>{localStorage.setItem('formease-progress',JSON.stringify({form,docs,service,screen,activeProfile}));},[form,docs,service,screen,activeProfile]);
 const stepIndex=Math.max(0,Math.min(5,['need','service','documents','form','check','review'].indexOf(screen)));const progress=Math.round(stepIndex/5*100);
 const go=s=>{setScreen(s);setMobileMenu(false);scrollTo({top:0,behavior:'smooth'})};
 const serviceCard=name=>{if(name==='__reminders__'){go('reminders');return}if(name==='__history__'){go('history');return}const d=duplicateCheck(name);if(d){setDuplicate(d);return}chooseService(name)};
 const update=(k,v)=>{setForm(p=>({...p,[k]:v}));setChecked(false)};
 const startAI = async () => {
  setLoading(true);

  const r = await understandRequest(request);

  // Scholarship clarification
  if (r.needsClarification && r.clarificationType === 'scholarship') {
    setUnderstanding({
      ...r,
      matches: [
        {
          name: 'Post-Matric Scholarship',
          category: 'Education',
          confidence: 1
        },
        {
          name: 'College / University Scholarship',
          category: 'Higher Education',
          confidence: 1
        }
      ]
    });

    setLoading(false);
    go('service');
    return;
  }

  setUnderstanding(r);

  // If AI identified a service directly
  if (r.service && !r.needsClarification) {
    setService(r.service);

    const s = getService(r.service);

    setForm(p => ({
      ...p,
      serviceNeedsIncome: s?.needsIncome,
      purpose: s?.purpose || p.purpose
    }));
  }

  setLoading(false);
  go('service');
};
 const chooseService=name=>{const dup=duplicateCheck(name);if(dup){setDuplicate(dup);return}const s=getService(name);setService(name);setUnderstanding({...s,service:name,needsClarification:false});setForm(p=>({...p,serviceNeedsIncome:s?.needsIncome,purpose:s?.purpose||p.purpose}));go('documents')};
 const runCheck=async()=>{setLoading(true);const r=await checkForm({...form,documents:docs,serviceNeedsIncome:getService(service)?.needsIncome});setIssues(r.issues);setChecked(true);setLoading(false)};
 const submit=()=>{const id='FE-2026-'+Math.floor(10000+Math.random()*89999);const record={id,service,applicant:form.name,status:'Submitted',createdAt:new Date().toISOString()};const next=[record,...applications];setApplications(next);localStorage.setItem('formease-applications',JSON.stringify(next));setAppId(id);const rr=[{id:id+'-1',title:service||'Application',text:'Check application status',when:'Tomorrow'},{id:id+'-2',title:service||'Application',text:'Review document status',when:'In 3 days'}];setReminders(rr);localStorage.setItem('formease-reminders',JSON.stringify(rr));go('submitted')};
 const speak=text=>{if('speechSynthesis'in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(text))}};
 const voice=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert('Voice input is not supported in this browser. Try Chrome or Edge.');return}const r=new SR();r.lang=t.code;r.interimResults=false;r.onresult=e=>setRequest(e.results[0][0].transcript);r.onerror=()=>alert('Voice input could not hear that. Check microphone permission and try again.');r.start()};
 const docsFor=getService(service)?.needsIncome?['identity','address','incomeProof','photo']:['identity','address','photo'];
 const uploadDoc=async(key,file)=>{if(!file)return;setLoading(true);try{const worker=await createWorker('eng');const {data}=await worker.recognize(file);await worker.terminate();const text=data.text;setDocFiles(p=>({...p,[key]:file.name}));setDocs(p=>({...p,[key]:{name:file.name,ocr:text,uploadedAt:new Date().toISOString()}}));const extract=(label,regex)=>{const m=text.match(regex);if(m?.[1])update(label,m[1].trim())};extract('name',/(?:name|नाम|పేరు)\s*[:\-]?\s*([A-Za-z .]{3,})/i);extract('mobile',/(?:mobile|phone|मोबाइल)\D*(\d{10})/i);extract('dob',/(?:dob|date of birth|जन्म)\D*(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/i);setAiFilled(p=>({...p,name:!!text.match(/(?:name|नाम|పేరు)/i),mobile:!!text.match(/(?:mobile|phone|मोबाइल)/i),dob:!!text.match(/(?:dob|date of birth|जन्म)/i)}));alert('OCR complete. Extracted values were placed into the form where confidently detected. Please verify them.')}catch(e){alert('OCR could not read this document. You can still enter details manually.')}setLoading(false)};
 const calcAge=dob=>{if(!dob)return'';const d=new Date(dob),n=new Date();let a=n.getFullYear()-d.getFullYear();if(n.getMonth()<d.getMonth()||(n.getMonth()===d.getMonth()&&n.getDate()<d.getDate()))a--;return String(a)};
 useEffect(()=>{if(form.dob){const a=calcAge(form.dob);if(form.age!==a)setForm(p=>({...p,age:a}))}},[form.dob]);
 const eligibilityScore=eligibility?Object.values(eligibility).filter(Boolean).length:0;
 const pdf=()=>{const p=new jsPDF();p.setFontSize(18);p.text('FormEase AI - Application Summary',15,18);p.setFontSize(11);let y=30;[['Application ID',appId],['Service',service||'Not selected'],['Applicant',form.name],['DOB',form.dob],['Age',form.age],['Mobile',form.mobile],['Occupation',form.occupation],['Income',form.income+' '+form.incomeFrequency]].forEach(([a,b])=>{p.text(`${a}: ${b||'-'}`,15,y);y+=8});p.text('Documents:',15,y);y+=8;Object.entries(docs).forEach(([k,v])=>{p.text(`${k}: ${v?'Ready':'Missing / not selected'}`,20,y);y+=7});p.text('Note: This is an independent guidance prototype, not an official approval.',15,y+8);p.save(`FormEase-${appId||'summary'}.pdf`)};
 const sync=()=>{const code=btoa(unescape(encodeURIComponent(JSON.stringify({form,docs,service})))).slice(0,16);setSyncCode(code);navigator.clipboard?.writeText(code)};
 const restore=()=>{try{const s=JSON.parse(decodeURIComponent(escape(atob(syncCode))));if(s.form)setForm(s.form);if(s.docs)setDocs(s.docs);if(s.service)setService(s.service);alert('Progress restored.')}catch{alert('Invalid sync code.')}};
 return <div className="app">{banner&&<div className="demo-banner"><ShieldCheck size={16}/> DEMO MODE — Synthetic data only. <button onClick={()=>setBanner(false)}><X size={16}/></button></div>}{!online&&<div className="offline"><CloudOff size={16}/> Offline mode: your progress is saved on this device and will sync when you reconnect.</div>}
 <header className="topbar"><button className="brand" onClick={()=>go('home')}><span className="brand-mark"><Sparkles size={19}/></span>FormEase <b>AI</b></button><nav className={mobileMenu?'nav open':'nav'}><button onClick={()=>go('home')}><HomeIcon size={16}/> Home</button><button onClick={()=>go('need')}><Sparkles size={16}/> Start</button><button onClick={()=>go('history')}><History size={16}/> My Applications</button><button onClick={()=>go('reminders')}><Clock size={16}/> Reminders {reminders.length>0&&<span className="nav-badge">{reminders.length}</span>}</button><button onClick={()=>setShowHelper(true)}><HelpCircle size={16}/> Helper</button><select value={language} onChange={e=>setLanguage(e.target.value)}><Languages size={16}/>{Object.keys(LANGS).map(x=><option key={x}>{x}</option>)}</select></nav><div className="access-controls"><button title="Dark mode" onClick={()=>setDark(!dark)}>◐</button><button title="Large text" onClick={()=>setLargeText(!largeText)}><Accessibility size={18}/></button><button title="Application history" onClick={()=>go('history')}><History size={18}/></button></div><button className="menu-btn" onClick={()=>setMobileMenu(!mobileMenu)}><Menu/></button></header>
 {screen!=='home'&&screen!=='submitted'&&screen!=='history'&&<div className="progress-wrap"><div className="progress-top"><span>Application journey · {STEPS[stepIndex]}</span><b>{progress}%</b></div><div className="save-status"><Save size={14}/> Last saved {relativeSaved}</div><div className="progress"><div style={{width:`${progress}%`}}/></div><div className="step-labels">{STEPS.map((s,i)=><span key={s} className={i<=stepIndex?'active':''}>{i+1}. {s}</span>)}</div></div>}
 <main>
 {screen==='home'&&<Home onStart={()=>go('need')} onDemo={()=>{setRequest('postmatric shcholar ship for college');go('need')}} onService={serviceCard} reminders={reminders} applications={applications}/>}
 {screen==='reminders'&&<Reminders reminders={reminders} onStart={()=>go('need')}/>}
 {screen==='need'&&<Shell eyebrow="STEP 1 · TELL US" title={t.need} sub="Use normal words, typos, or your regional language. FormEase will clarify instead of guessing."><div className="ai-input-card"><div className="ai-orb"><Bot/></div><div className="grow"><label>Tell FormEase what you need</label><textarea value={request} onChange={e=>setRequest(e.target.value)} placeholder="Example: postmatric shcholar ship for college"/><div className="input-actions"><span><Sparkles size={14}/> AI intent + typo matching</span><div><button className="icon-btn" onClick={voice}><Mic size={18}/></button><button className="icon-btn" onClick={()=>speak(request||'Tell us what you need')}><Volume2 size={18}/></button></div></div></div></div><div className="suggestions"><button onClick={()=>setRequest('scholarship')}>Scholarship</button><button onClick={()=>setRequest('pension')}>Pension</button><button onClick={()=>setRequest('caste certificate')}>Certificate</button><button onClick={()=>setRequest('government job')}>Government job</button></div><div className="actions"><button className="btn ghost" onClick={()=>go('home')}><ArrowLeft/>{t.back}</button><button className="btn primary" disabled={!request.trim()||loading} onClick={startAI}>{loading?'Understanding...':t.understand}<ArrowRight/></button></div></Shell>}
{screen==='service'&&
  <Shell
    eyebrow="STEP 2 · AI CLARIFICATION"
    title={understanding?.needsClarification ? "Let's confirm your need" : "Here's what we understood"}
    sub={understanding?.explanation || ''}
  >
    {understanding?.needsClarification ? (
      <>
        <div className="clarify">
          <CircleHelp/>
          <div>
            <b>
              {understanding.clarificationType === 'scholarship'
                ? 'What type of scholarship are you looking for?'
                : 'Which service do you need?'}
            </b>

            <p>
              I don't want to send you through the wrong application.
            </p>
          </div>
        </div>

        <div className="service-options">

          {/* SCHOLARSHIP OPTIONS */}
          {understanding.clarificationType === 'scholarship' && (
            <>
              <button
                className="service-option"
                onClick={() => chooseService('Post-Matric Scholarship')}
              >
                <b>🎓 Post-Matric Scholarship</b>
                <span>
                  Education · For students seeking education financial assistance
                </span>
              </button>

              <button
                className="service-option"
                onClick={() => chooseService('College / University Scholarship')}
              >
                <b>📚 College / University Scholarship</b>
                <span>
                  Higher Education · Scholarship guidance for college/university
                </span>
              </button>
            </>
          )}

          {/* OTHER AI MATCHES */}
          {understanding.clarificationType !== 'scholarship' &&
            understanding.matches?.map(s => (
              <button
                key={s.name}
                className="service-option"
                onClick={() => chooseService(s.name)}
              >
                <b>{s.name}</b>
                <span>
                  {s.category}
                  {s.confidence
                    ? ` · ${Math.round(s.confidence * 100)}% match`
                    : ''}
                </span>
              </button>
            ))
          }

        </div>

        <button
          className="btn ghost"
          onClick={() => go('need')}
        >
          Describe it differently
        </button>
      </>
    ) : (
      <>
        <div className="understand-card">
          <CheckCircle2/>
          <div>
            <span className="muted">Selected service</span>
            <h2>{service}</h2>
            <p>{understanding?.purpose}</p>
          </div>
        </div>

        <div className="actions">
          <button
            className="btn ghost"
            onClick={() => go('need')}
          >
            <ArrowLeft/>
            Back
          </button>

          <button
            className="btn primary"
            onClick={() => go('documents')}
          >
            Continue
            <ArrowRight/>
          </button>
        </div>
      </>
    )}
  </Shell>
}
 {screen==='documents'&&<Shell eyebrow="STEP 3 · DOCUMENTS" title="Upload once, auto-fill where possible" sub="Snap or upload a document. OCR extracts text in your browser; verify every extracted value before continuing."><div className="scanner-actions"><label className="btn ghost"><Camera/> Scan with camera<input hidden type="file" accept="image/*" capture="environment" onChange={e=>{const f=e.target.files?.[0];if(f)uploadDoc(docsFor.find(k=>!docs[k])||'identity',f)}}/></label><button className="btn ghost" onClick={shareChecklist}><Share2/> Share checklist</button></div><div className="doc-list">{docsFor.map(key=><DocRow key={key} k={key} value={docs[key]} onUpload={uploadDoc} onToggle={()=>setDocs(p=>({...p,[key]:p[key]?null:{manual:true}}))}/>)}</div><div className="expiry-card"><b>Document expiry tracking</b><p>Set an expiry date for certificates/IDs and FormEase will warn you before renewal is needed.</p><div className="expiry-grid">{Object.keys(docs).filter(k=>docs[k]).map(k=><input key={k} type="date" value={expiry[k]||''} onChange={e=>setExpiry({...expiry,[k]:e.target.value})} aria-label={`${k} expiry`}/>)}</div></div><div className="doc-summary"><FileText/><b>{docsFor.filter(k=>docs[k]).length} of {docsFor.length}</b> documents ready</div><div className="actions"><button className="btn ghost" onClick={()=>go('service')}><ArrowLeft/>Back</button><button className="btn primary" onClick={()=>go('form')}>Start guided form <ArrowRight/></button></div></Shell>}
 {screen==='form'&&<Shell eyebrow="STEP 4 · GUIDED FORM" title="Your details" sub="Fields detected by OCR are prefilled. Age is calculated automatically."><div className="profile-bar"><b>Applicant profile</b><select value={activeProfile} onChange={e=>setActiveProfile(e.target.value)}>{profiles.map(p=><option key={p.id} value={p.id}>{p.name} · {p.relation}</option>)}</select><button className="text-btn" onClick={()=>{const name=prompt('Family member name?');if(name){const p={id:Date.now()+'',name,relation:'Family member'};setProfiles([...profiles,p]);setActiveProfile(p.id)}}}><UserPlus size={16}/> Add family member</button></div><div className="form-card">{[['name','Full name','text'],['dob','Date of birth','date'],['age','Age','number'],['mobile','Mobile number','text']].map(([k,l,type])=><div key={k} className="field-wrap"><Field label={l} value={form[k]||''} type={type} disabled={k==='age'} onChange={v=>{update(k,k==='mobile'?v.replace(/\D/g,'').slice(0,10):v);if(aiFilled[k])setAiFilled(p=>({...p,[k]:false}))}}/>{aiFilled[k]&&<small className="ai-confidence">AI-filled — please verify</small>}</div>) }<Field label="Occupation" value={form.occupation||''} type="text" onChange={v=>update('occupation',v)}/>{getService(service)?.needsIncome&&<><Field label="Family income" value={form.income||''} type="number" onChange={v=>update('income',v)}/><div className="field"><label>Income frequency</label><select value={form.incomeFrequency||''} onChange={e=>update('incomeFrequency',e.target.value)}><option value="">Select</option><option>Monthly</option><option>Yearly</option></select></div></>}</div><div className="eligibility"><h3>Quick eligibility checker</h3><p>Answer before spending time on the full application.</p>{['I meet the age/beneficiary condition','My income/category matches the scheme','I have the required residence/status'].map((q,i)=><label key={q}><input type="checkbox" checked={!!eligibility?.[i]} onChange={e=>setEligibility({...eligibility,[i]:e.target.checked})}/>{q}</label>)}<b>{eligibilityScore>=2?'Likely eligible — verify official rules before applying.':'Complete the quick check to see a provisional result.'}</b></div><div className="actions"><button className="btn ghost" onClick={()=>go('documents')}><ArrowLeft/>Back</button><button className="btn primary" onClick={()=>go('check')}>AI form check <Sparkles/></button></div></Shell>}
 {screen==='check'&&<Shell eyebrow="STEP 5 · AI CHECK" title="Catch mistakes before submission" sub="Checks required fields, document availability, expiry warnings and obvious inconsistencies.">{!checked?<div className="check-start"><Bot size={45}/><h2>Ready?</h2><button className="btn primary large" onClick={runCheck} disabled={loading}>{loading?'Checking...':'Run AI Form Check'}<Sparkles/></button></div>:<><div className={issues.length?'check-result has-issues':'check-result ready'}>{issues.length?<><CircleHelp/><div><h2>{issues.length} issue(s) found</h2><p>Fix these before review.</p></div></>:<><CheckCircle2/><div><h2>Looks ready</h2><p>No obvious issues detected.</p></div></>}</div>{issues.map(i=><div className="issue" key={i.field}><b>{i.title}</b><p>{i.message}</p><small>How to fix: {i.fix}</small></div>)}<div className="actions"><button className="btn ghost" onClick={()=>go('form')}>Edit form</button>{!issues.length&&<button className="btn primary" onClick={()=>go('review')}>Review <ArrowRight/></button>}</div></>}</Shell>}
 {screen==='review'&&<Shell eyebrow="STEP 6 · REVIEW" title="Final review" sub="Download a physical copy or continue to the simulated submission.">{daysLeft!==null&&<div className="deadline"><Clock/><div><b>{daysLeft} days left to apply</b><span>Deadline: {DEADLINES[service]} · verify the latest date on the official scheme portal.</span></div></div>}<div className="review-grid"><Review title="Service" value={service}/><Review title="Applicant" value={form.name}/><Review title="DOB / Age" value={`${form.dob} / ${form.age}`}/><Review title="Documents" value={`${docsFor.filter(k=>docs[k]).length}/${docsFor.length} ready`}/></div><div className="feedback"><b>Was this AI suggestion useful?</b><button onClick={()=>setFeedback({...feedback,ai:'up'})} className={feedback.ai==='up'?'selected':''}><ThumbsUp size={16}/></button><button onClick={()=>setFeedback({...feedback,ai:'down'})} className={feedback.ai==='down'?'selected':''}><ThumbsDown size={16}/></button><span>{feedback.ai?'Thanks — this feedback helps improve future suggestions.':''}</span></div><div className="faq"><h3>Others also asked</h3>{faq.map(q=><details key={q}><summary>{q}</summary><p>Use the official scheme FAQ/portal to confirm the latest requirement for your state and service.</p></details>)}</div><div className="actions"><button className="btn ghost" onClick={()=>go('check')}>Back</button><button className="btn ghost" onClick={pdf}><Download/>Download PDF</button><button className="btn primary" onClick={submit}>Submit Demo <ArrowRight/></button></div></Shell>}
 {screen==='history'&&<Shell eyebrow="APPLICATION HISTORY" title="Your applications" sub="Keep a portable record of application references."><div className="history-toolbar"><button className="btn ghost" onClick={exportHistory}><Download/> Export history</button></div>{applications.length?<div className="history-list">{applications.map(a=><div className="history-item" key={a.id}><div><b>{a.service}</b><p>{a.id} · {a.applicant||'Applicant'}</p></div><span>{a.status}</span></div>)}</div>:<div className="empty">No applications saved yet.</div>}</Shell>} {screen==='submitted'&&<Shell eyebrow="APPLICATION SAVED" title="Your application is being tracked" sub="This prototype does not connect to a government backend."><div className="submitted"><CheckCircle2 size={55}/><h2>{appId}</h2><p><b>{service}</b></p><div className="tracking"><h3>Post-submission checklist</h3><label>☐ Save your government portal acknowledgement/reference number</label><label>☐ Check application status on the official portal</label><label>☐ Watch for document-verification requests</label><label>☐ Keep SMS/WhatsApp/email alerts enabled where available</label></div><div className="status"><b>Status: Submitted (Demo)</b><span>Next: status updates and reminders can be sent through SMS/WhatsApp when a provider/backend is connected.</span></div><div className="reminder-panel">{reminders.map(r=><div className="reminder" key={r.id}><MessageCircle/><div><b>{r.title}</b><p>{r.text} · {r.when}</p></div></div>)}</div><div className="sync"><h3>Continue on another device</h3><p>For this demo, create a temporary sync code. Production should store encrypted progress against the user's account.</p><button className="btn ghost" onClick={sync}><RefreshCw/>Create sync code</button>{syncCode&&<input value={syncCode} onChange={e=>setSyncCode(e.target.value)} />}</div><div className="actions"><button className="btn ghost" onClick={pdf}><Download/>PDF summary</button><button className="btn primary" onClick={()=>go('home')}><HomeIcon/>Home</button></div></div></Shell>}
 </main>{duplicate&&<div className="modal"><div className="modal-card"><button className="modal-x" onClick={()=>setDuplicate(null)}><X/></button><AlertTriangle/><h2>Possible duplicate application</h2><p>You already have a <b>{duplicate.service}</b> application in progress ({duplicate.id}). Starting another one may create duplicate work.</p><div className="actions"><button className="btn ghost" onClick={()=>{setDuplicate(null);go('submitted');setAppId(duplicate.id)}}>Open existing</button><button className="btn primary" onClick={()=>{const n=duplicate.service;setDuplicate(null);const ss=getService(n);setService(n);setUnderstanding({...ss,service:n});go('documents')}}>Start anyway</button></div></div></div>}{showHelper&&<div className="modal"><div className="modal-card"><button className="modal-x" onClick={()=>setShowHelper(false)}><X/></button><h2>Talk to a helper</h2><p>If FormEase cannot resolve your case, a human helper can review the issue. This demo shows the escalation flow.</p><textarea placeholder="Describe what you need help with"/><button className="btn primary" onClick={()=>{alert('Helper request created (demo).');setShowHelper(false)}}><MessageCircle/>Request human help</button></div></div>}
 </div>}
function Shell({eyebrow,title,sub,children}){return <section className="shell"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p className="subtitle">{sub}</p>{children}</section>}
function Home({onStart,onDemo,onService,reminders,applications}){return <div className="home-page"><section className="hero"><div className="hero-copy"><span className="pill"><Sparkles size={15}/> AI-powered government service guidance</span><h1>Government services, <span>made simple.</span></h1><p>Find the right service, check eligibility, prepare documents, fill forms and track your application in one guided experience.</p><div className="hero-actions"><button className="btn primary large" onClick={onStart}>Start with AI <ArrowRight/></button><button className="btn ghost" onClick={onDemo}>Try typo demo</button></div><div className="feature-strip"><span>OCR auto-fill</span><span>Voice input</span><span>Offline save</span><span>Family profiles</span><span>PDF summary</span></div></div><div className="hero-card"><Bot size={34}/><h3>One assistant. Many services.</h3><p>Scholarships · pensions · certificates · jobs · ration · health · farmer services · grievances</p><div className="hero-stats"><b>{SERVICES.length}+<small>Services</small></b><b>{applications.length}<small>Applications</small></b><b>{reminders.length}<small>Reminders</small></b></div></div></section><section className="home-section"><div className="section-heading"><span className="eyebrow">SERVICES</span><h2>What do you need help with?</h2><p>Choose a service or tell FormEase what you need in your own words.</p></div><div className="service-grid">{SERVICES.map(([name,icon,desc])=><button className="home-service-card" key={name} onClick={()=>onService(name)}><span className="service-icon">{icon}</span><span className="service-card-copy"><b>{name}</b><small>{desc}</small></span><ArrowRight size={17}/></button>)}</div></section><section className="home-section info-grid"><div className="info-card"><Clock/><div><h3>Reminders</h3><p>{reminders.length?`${reminders.length} follow-up reminder(s) saved.`:'Never miss an application follow-up.'}</p><button className="text-link" onClick={()=>onService('__reminders__')}>View reminders <ArrowRight size={15}/></button></div></div><div className="info-card"><History/><div><h3>My Applications</h3><p>{applications.length?`${applications.length} application record(s) saved.`:'Track your application references here.'}</p><button className="text-link" onClick={()=>onService('__history__')}>View applications <ArrowRight size={15}/></button></div></div><div className="info-card"><ShieldCheck/><div><h3>Safe & simple</h3><p>Prepare and validate with FormEase, then continue to the official government portal.</p></div></div></section><section className="home-section how-section"><div className="section-heading"><span className="eyebrow">HOW IT WORKS</span><h2>From need to application</h2></div><div className="how-grid">{[['01','Tell us','Type or speak your need.'],['02','Clarify','AI handles typos and asks when confidence is low.'],['03','Prepare','Check eligibility and upload documents with OCR.'],['04','Complete','Review, download your summary and track progress.']].map(x=><div className="how-card" key={x[0]}><span>{x[0]}</span><h3>{x[1]}</h3><p>{x[2]}</p></div>)}</div></section><section className="home-section feature-section"><div className="section-heading"><span className="eyebrow">ACCESSIBLE FOR EVERYONE</span><h2>Built for real applicants</h2></div><div className="feature-grid">{[['🎙️','Regional voice input','Speak instead of typing.'],['📷','Document OCR','Extract details from uploaded documents.'],['💾','Auto-save','Continue after interruptions or low connectivity.'],['🌐','Indian languages','English, Telugu, Hindi, Marathi, Tamil and Kannada.'],['👨‍👩‍👧','Family profiles','Manage applications for dependents.'],['🤝','Human helper','Escalate difficult cases to a helper.']].map(x=><div className="feature-card" key={x[1]}><span>{x[0]}</span><div><b>{x[1]}</b><p>{x[2]}</p></div></div>)}</div></section><section className="home-cta"><div><h2>Ready to simplify a government form?</h2><p>Start with the service you need or describe it naturally.</p></div><button className="btn primary large" onClick={onStart}>Start now <ArrowRight/></button></section></div>}
function Reminders({reminders,onStart}){return <Shell eyebrow="REMINDERS" title="Your reminders" sub="Follow-ups are saved locally in this prototype.">{reminders.length?<div className="reminders-page">{reminders.map(r=><div className="reminder-card" key={r.id}><Clock/><div className="grow"><b>{r.title}</b><p>{r.text}</p><small>{r.when}</small></div></div>)}</div>:<div className="empty"><Clock/><h3>No reminders yet</h3><p>Submit an application to create follow-up reminders.</p><button className="btn primary" onClick={onStart}>Start application <ArrowRight/></button></div>}</Shell>}
function Field({label,value,type,onChange,disabled}){return <div className="field"><label>{label}</label><input type={type} value={value} disabled={disabled} onChange={e=>onChange(e.target.value)}/></div>}
function DocRow({k,value,onUpload,onToggle}){const labels={identity:'Identity proof',address:'Address proof',incomeProof:'Income proof',photo:'Passport photo'};return <div className="doc-item"><div className={'doc-state '+(value?'ready':'missing')}>{value?<Check/>:<Upload/>}</div><div className="grow"><b>{labels[k]}</b><p>{value?.ocr?`OCR detected text: ${value.ocr.slice(0,100)}${value.ocr.length>100?'…':''}`:'Upload a photo/PDF or mark as available manually.'}</p>{value&&<small className="success">Ready · {value.name||'manual'}</small>}</div><label className="upload-btn"><Upload size={16}/>Upload<input type="file" accept="image/*,.pdf" onChange={e=>onUpload(k,e.target.files?.[0])}/></label><button className="text-btn" onClick={onToggle}>{value?'Mark missing':'Mark available'}</button></div>}
function Review({title,value}){return <div className="review-card"><span>{title}</span><b>{value||'Not selected'}</b></div>}
export default App;
