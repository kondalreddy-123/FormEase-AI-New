const SERVICES = [
  {name:'Post-Matric Scholarship', aliases:['post matric scholarship','postmatric scholarship','postmatric shcholar ship','post matric shcolarship','scholarship'], category:'Scholarship', purpose:'Education / Scholarship', needsIncome:true},
  {name:'College / University Scholarship', aliases:['college scholarship','university scholarship','college university scholarship'], category:'Scholarship', purpose:'Education / Scholarship', needsIncome:true},
  {name:'Old Age Pension', aliases:['old age pension','senior pension','vruddha pension','pension for old people'], category:'Pension', purpose:'Social security', needsIncome:true},
  {name:'Widow Pension', aliases:['widow pension','pension for widow'], category:'Pension', purpose:'Social security', needsIncome:true},
  {name:'Disability Pension', aliases:['disability pension','disabled pension'], category:'Pension', purpose:'Social security', needsIncome:true},
  {name:'Income Certificate', aliases:['income certificate','income proof certificate','family income certificate'], category:'Certificate', purpose:'Proof of income', needsIncome:true},
  {name:'Caste Certificate', aliases:['caste certificate','sc st bc certificate','community certificate'], category:'Certificate', purpose:'Community / category proof', needsIncome:false},
  {name:'Residence Certificate', aliases:['residence certificate','domicile certificate','address certificate'], category:'Certificate', purpose:'Residence proof', needsIncome:false},
  {name:'Birth Certificate', aliases:['birth certificate','birth proof'], category:'Certificate', purpose:'Birth record', needsIncome:false},
  {name:'Death Certificate', aliases:['death certificate','death record'], category:'Certificate', purpose:'Death record', needsIncome:false},
  {name:'Disability Certificate / UDID', aliases:['disability certificate','udid','udid card'], category:'Certificate', purpose:'Disability identity', needsIncome:false},
  {name:'PM-KISAN / Farmer Services', aliases:['pm kisan','pm-kisan','farmer service','farmer scheme','kisan'], category:'Farmer', purpose:'Farmer support', needsIncome:false},
  {name:'Housing Assistance', aliases:['housing','house scheme','housing assistance','home scheme'], category:'Welfare', purpose:'Housing support', needsIncome:true},
  {name:'Employment / Job Services', aliases:['job','government job','employment','employment service'], category:'Employment', purpose:'Employment support', needsIncome:false},
  {name:'Health Scheme / Ayushman Services', aliases:['ayushman','health scheme','health card','medical scheme'], category:'Health', purpose:'Healthcare support', needsIncome:false},
  {name:'Ration Card Services', aliases:['ration card','food card','ration'], category:'Food', purpose:'Food security', needsIncome:true},
  {name:'Aadhaar-related Services', aliases:['aadhaar','aadhar','aadhaar update','aadhar update'], category:'Identity', purpose:'Identity service', needsIncome:false},
  {name:'Voter ID Services', aliases:['voter id','voter card','election id'], category:'Identity', purpose:'Voter service', needsIncome:false},
  {name:'Driving Licence Services', aliases:['driving licence','driving license','dl renewal'], category:'Transport', purpose:'Driving licence service', needsIncome:false},
  {name:'Government Grievance', aliases:['complaint','grievance','complain government','grievance portal'], category:'Grievance', purpose:'Public grievance', needsIncome:false}
];

const normalize = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
function distance(a,b){const m=a.length,n=b.length;const d=Array.from({length:m+1},(_,i)=>{const r=Array(n+1);r[0]=i;return r});for(let j=0;j<=n;j++)d[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return d[m][n]}
function score(text, alias){const t=normalize(text), a=normalize(alias); if(!a) return 0; if(t.includes(a)) return 1; const words=t.split(' '); const aw=a.split(' '); let best=0; for(let i=0;i<=words.length-aw.length;i++){const chunk=words.slice(i,i+aw.length).join(' '); const dist=distance(chunk,a); best=Math.max(best,1-dist/Math.max(chunk.length,a.length));} return best;}

export async function understandRequest(text){
  const raw=String(text||'').trim(), t=normalize(raw);
  const ranked=SERVICES.map(s=>({...s, confidence:Math.max(...s.aliases.map(a=>score(t,a)))})).sort((a,b)=>b.confidence-a.confidence);
  const top=ranked[0]; const second=ranked[1];
  const broad=['scholarship','pension','certificate','housing','job','employment','loan','ration','health','farmer','aadhaar','voter'].some(x=>t===x || t.includes(x+' service') || t.endsWith(' '+x));
  if(!top || top.confidence<0.52) return {service:null, confidence:0, needsClarification:true, matches:ranked.slice(0,5), explanation:'I could not confidently identify the government service. I will ask a clarifying question instead of guessing.'};
  if(broad || top.confidence<0.72 || (second && top.confidence-second.confidence<0.08)) return {service:null, confidence:top.confidence, needsClarification:true, matches:ranked.filter(x=>x.confidence>0.38).slice(0,5), suggested:top.name, explanation:`I found a likely match, but I want to confirm before starting the wrong form.`};
  return {service:top.name, confidence:top.confidence, needsClarification:false, matches:[top], purpose:top.purpose, category:top.category, needsIncome:top.needsIncome, explanation:`You appear to be looking for ${top.name}.`};
}
export function getService(name){return SERVICES.find(s=>s.name===name) || null}
export function listServices(){return SERVICES}
export function explainField(field){return ({name:'This identifies the person submitting the application.',dob:'Your date of birth helps verify identity and eligibility.',mobile:'Use a reachable 10-digit mobile number for updates.',occupation:'This describes the applicant’s main work or activity.',income:'Report the income amount and select whether it is monthly or yearly.',purpose:'This explains why you need the service.'}[field] || 'Enter only information requested by the selected service.');}
export async function checkForm(data){const issues=[];const mobile=String(data.mobile||'').replace(/\D/g,'');if(!data.name?.trim())issues.push({field:'name',title:'Full name',message:'Your name is missing.',fix:'Enter the applicant full name.'});if(!data.dob)issues.push({field:'dob',title:'Date of birth',message:'Date of birth is missing.',fix:'Select a valid date.'});if(mobile.length!==10)issues.push({field:'mobile',title:'Mobile number',message:'Mobile number should contain 10 digits.',fix:'Enter a 10-digit number.'});if(data.serviceNeedsIncome && !data.income)issues.push({field:'income',title:'Income',message:'This service requires income information.',fix:'Enter the reported family income.'});if(data.serviceNeedsIncome && !data.incomeFrequency)issues.push({field:'incomeFrequency',title:'Income frequency',message:'Income frequency is missing.',fix:'Choose Monthly or Yearly.'});if(data.serviceNeedsIncome && !data.documents?.incomeProof)issues.push({field:'documents',title:'Income proof',message:'Income proof is not available.',fix:'Upload or mark the required income document.'});if(data.dob){const b=new Date(data.dob),n=new Date();let age=n.getFullYear()-b.getFullYear();if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))age--;if(Number(data.age)!==age)issues.push({field:'age',title:'Age and date of birth',severity:'warning',message:`DOB indicates age ${age}, but the form shows ${data.age||'blank'}.`,fix:'Use the automatically calculated age.'});}return {issues,ready:!issues.length};}
