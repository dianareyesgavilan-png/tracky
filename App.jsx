import { useState, useRef, useEffect, useCallback } from "react";

/* ═══ SKINS ═══════════════════════════════════════════════════════════════ */
const SKINS = {
  green: { id:"green", name:"Forest Green", nameEs:"Verde Bosque",
    bg:"#0b120b", card:"#131b13", surface:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.08)",
    accent:"#7ecf7a", accentDim:"rgba(126,207,122,0.12)", accentBorder:"rgba(126,207,122,0.22)",
    text:"#f0ede8", textMuted:"rgba(255,255,255,0.28)", blue:"#90bfff", orange:"#ffb450" },
  teal: { id:"teal", name:"Dark Teal", nameEs:"Azul Petróleo",
    bg:"#071a1a", card:"#0d2424", surface:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.08)",
    accent:"#3dd6c8", accentDim:"rgba(61,214,200,0.12)", accentBorder:"rgba(61,214,200,0.22)",
    text:"#e8f4f4", textMuted:"rgba(255,255,255,0.28)", blue:"#7dd4e8", orange:"#ffb450" },
  terra: { id:"terra", name:"Warm Terracotta", nameEs:"Terracota",
    bg:"#130d08", card:"#1e1208", surface:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.08)",
    accent:"#e8845a", accentDim:"rgba(232,132,90,0.12)", accentBorder:"rgba(232,132,90,0.25)",
    text:"#f5ece4", textMuted:"rgba(255,255,255,0.28)", blue:"#d4a574", orange:"#f6c954" },
  rose: { id:"rose", name:"Rose", nameEs:"Rosa",
    bg:"#140a0e", card:"#1e0e16", surface:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.08)",
    accent:"#e87aaa", accentDim:"rgba(232,122,170,0.12)", accentBorder:"rgba(232,122,170,0.22)",
    text:"#f7eef2", textMuted:"rgba(255,255,255,0.28)", blue:"#d4a0c0", orange:"#f6c954" },
  black: { id:"black", name:"Sleek Black", nameEs:"Negro Sleek",
    bg:"#080808", card:"#111111", surface:"rgba(255,255,255,0.03)", border:"rgba(255,255,255,0.07)",
    accent:"#e8e8e8", accentDim:"rgba(232,232,232,0.08)", accentBorder:"rgba(232,232,232,0.18)",
    text:"#ffffff", textMuted:"rgba(255,255,255,0.25)", blue:"#7eb8ff", orange:"#ffb347" },
};

/* ═══ i18n ════════════════════════════════════════════════════════════════ */
const T = {
  en: {
    appTagline:"meal journal", today:"Today", week:"Week", history:"History",
    breakfast:"Breakfast", morningSnack:"Morn. Snack", lunch:"Lunch",
    afternoonSnack:"Aftn. Snack", dinner:"Dinner", eveningSnack:"Eve. Snack",
    weight:"Weight", workout:"Workout", logWeight:"Log Weight", logWorkout:"Log Workout",
    save:"Save", cancel:"Cancel", back:"Back", unlock:"Unlock",
    whoAreYou:"Who are you?", or:"or", createAccount:"Create new account",
    welcomeBack:"Welcome back,", enterPin:"Enter your 4-digit PIN",
    yourName:"Your name", choosePin:"Choose a 4-digit PIN",
    nameTaken:"Name already taken", pinDigits:"PIN must be 4 digits", enterName:"Enter your name",
    of:"of", mealsLogged:"Meals logged", workoutDays:"Workout days", avgWeight:"Avg weight",
    allLoggedDays:"All logged days", addPastEntry:"Add past entry",
    editPastEntry:"Tap any tile to edit this past entry",
    pastEntry:"past entry", timeLogged:"Time logged",
    addPhotos:"Add photos", aiAnalysis:"AI Analysis", demoAiAnalysis:"Demo AI Analysis",
    confirmSave:"✓ Confirm & Save", description:"Description", ingredients:"Ingredients",
    tapToRename:"tap to rename · × to remove", addIngredient:"Add ingredient… press Enter",
    nutritionEstimate:"Nutrition estimate", kcalTotal:"kcal total", kcal:"kcal",
    analyzing:"Analyzing", analyzeHint:"Ingredient & nutrition editor coming up",
    demoMode:"Demo mode — mock values shown. Real AI activates after deploying.",
    demoTag:"Demo mode — AI is mocked", thisWeek:"This Week", weightTrend:"Weight trend",
    logWeightDaily:"Log weight daily to see the trend here",
    noHistory:"No history yet — start logging today!",
    reminderSet:"✓ Reminders set!", reminderBlocked:"Blocked — enable in browser settings",
    notifUnsupported:"Notifications not supported",
    workoutType:"Type", duration:"Duration (min)", intensity:"Intensity", time:"Time",
    easy:"Easy", moderate:"Moderate", hard:"Hard", saveWorkout:"Save Workout",
    pdfExport:"PDF ↗", noFoods:"No foods logged", daysTap:"Tap any day to view or edit",
    language:"Language", skin:"Theme", profile:"Profile", settingsSaved:"✓ Settings saved!",
    kg:"kg", days:"days", protein:"Protein", carbs:"Carbs", fat:"Fat", fibre:"Fibre",
    prot:"Prot", carb:"Carbs", dailyTotal:"Daily total",
    printPdf:"Print / Save as PDF", notes:"Notes… (e.g. restaurant, homemade)",
  },
  es: {
    appTagline:"diario de comidas", today:"Hoy", week:"Semana", history:"Historial",
    breakfast:"Desayuno", morningSnack:"Snack Mañana", lunch:"Almuerzo",
    afternoonSnack:"Snack Tarde", dinner:"Cena", eveningSnack:"Snack Noche",
    weight:"Peso", workout:"Entrenamiento", logWeight:"Registrar Peso", logWorkout:"Registrar Entreno",
    save:"Guardar", cancel:"Cancelar", back:"Volver", unlock:"Entrar",
    whoAreYou:"¿Quién eres?", or:"o", createAccount:"Crear nueva cuenta",
    welcomeBack:"Bienvenida,", enterPin:"Ingresa tu PIN de 4 dígitos",
    yourName:"Tu nombre", choosePin:"Elige un PIN de 4 dígitos",
    nameTaken:"Ese nombre ya existe", pinDigits:"El PIN debe tener 4 dígitos", enterName:"Ingresa tu nombre",
    of:"de", mealsLogged:"Comidas registradas", workoutDays:"Días de entreno", avgWeight:"Peso promedio",
    allLoggedDays:"Todos los días registrados", addPastEntry:"Agregar entrada pasada",
    editPastEntry:"Toca cualquier tarjeta para editar esta entrada pasada",
    pastEntry:"entrada pasada", timeLogged:"Hora registrada",
    addPhotos:"Agregar fotos", aiAnalysis:"Análisis IA", demoAiAnalysis:"Análisis IA (Demo)",
    confirmSave:"✓ Confirmar y guardar", description:"Descripción", ingredients:"Ingredientes",
    tapToRename:"toca para renombrar · × para quitar", addIngredient:"Agregar ingrediente… Enter",
    nutritionEstimate:"Estimación nutricional", kcalTotal:"kcal total", kcal:"kcal",
    analyzing:"Analizando", analyzeHint:"El editor de ingredientes viene pronto",
    demoMode:"Modo demo — valores de ejemplo. La IA real se activa al publicar.",
    demoTag:"Modo demo — IA simulada", thisWeek:"Esta Semana", weightTrend:"Tendencia de peso",
    logWeightDaily:"Registra tu peso diario para ver la tendencia",
    noHistory:"Sin historial todavía — ¡empieza a registrar hoy!",
    reminderSet:"✓ ¡Recordatorios activados!", reminderBlocked:"Bloqueado — activa en configuración",
    notifUnsupported:"Notificaciones no soportadas",
    workoutType:"Tipo", duration:"Duración (min)", intensity:"Intensidad", time:"Hora",
    easy:"Fácil", moderate:"Moderado", hard:"Intenso", saveWorkout:"Guardar Entreno",
    pdfExport:"PDF ↗", noFoods:"Sin comidas registradas", daysTap:"Toca cualquier día para ver o editar",
    language:"Idioma", skin:"Tema", profile:"Perfil", settingsSaved:"✓ ¡Configuración guardada!",
    kg:"kg", days:"días", protein:"Proteína", carbs:"Carbos", fat:"Grasa", fibre:"Fibra",
    prot:"Prot", carb:"Carbos", dailyTotal:"Total del día",
    printPdf:"Imprimir / Guardar PDF", notes:"Notas… (ej. restaurante, casero)",
  },
};

/* ═══ CONSTANTS ═══════════════════════════════════════════════════════════ */
const IS_DEMO = false;
const WORKOUT_TYPES = ["Run 🏃","Walk 🚶","Cycle 🚴","Swim 🏊","Gym 🏋️","Yoga 🧘","HIIT ⚡","Pilates 🩰","Hike 🥾","Other 💪"];

const getMealSlots = (lang) => [
  { id:"breakfast",       label:T[lang].breakfast,      icon:"🌅", rH:8,  rM:0  },
  { id:"morning_snack",   label:T[lang].morningSnack,   icon:"🍎", rH:10, rM:30 },
  { id:"lunch",           label:T[lang].lunch,          icon:"☀️", rH:13, rM:0  },
  { id:"afternoon_snack", label:T[lang].afternoonSnack, icon:"🫐", rH:16, rM:0  },
  { id:"dinner",          label:T[lang].dinner,         icon:"🌙", rH:19, rM:0  },
  { id:"evening_snack",   label:T[lang].eveningSnack,   icon:"🌛", rH:21, rM:0  },
];

/* ═══ HELPERS ═════════════════════════════════════════════════════════════ */
const todayKey = () => new Date().toISOString().slice(0,10);
const isoDate  = d  => d.toISOString().slice(0,10);
const fmtFull  = (iso,lang) => { const [y,m,d]=iso.split("-").map(Number); return new Date(y,m-1,d).toLocaleDateString(lang==="es"?"es-AR":"en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}); };
const fmtMed   = (iso,lang) => { const [y,m,d]=iso.split("-").map(Number); return new Date(y,m-1,d).toLocaleDateString(lang==="es"?"es-AR":"en-US",{weekday:"short",month:"short",day:"numeric"}); };
const fmtDow   = (iso,lang) => { const [y,m,d]=iso.split("-").map(Number); return new Date(y,m-1,d).toLocaleDateString(lang==="es"?"es-AR":"en-US",{weekday:"short"}); };

function getWeekDays(anchor) {
  const [y,m,d]=anchor.split("-").map(Number); const a=new Date(y,m-1,d);
  const mon=new Date(a); mon.setDate(a.getDate()-((a.getDay()+6)%7));
  return Array.from({length:7},(_,i)=>{ const dd=new Date(mon); dd.setDate(mon.getDate()+i); return isoDate(dd); });
}
function getCalendarDays(year,month) {
  const first=new Date(year,month,1); const last=new Date(year,month+1,0);
  const startDow=(first.getDay()+6)%7;
  const days=[]; for(let i=0;i<startDow;i++) days.push(null);
  for(let d=1;d<=last.getDate();d++) days.push(isoDate(new Date(year,month,d)));
  return days;
}
function toBase64(file) { return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result.split(",")[1]); r.onerror=rej; r.readAsDataURL(file); }); }
async function resizeImage(base64,mediaType,maxW=800) {
  return new Promise(res=>{ const img=new Image(); img.onload=()=>{ const s=Math.min(1,maxW/img.width); const c=document.createElement("canvas"); c.width=Math.round(img.width*s); c.height=Math.round(img.height*s); c.getContext("2d").drawImage(img,0,0,c.width,c.height); res(c.toDataURL("image/jpeg",0.82).split(",")[1]); }; img.src=`data:${mediaType};base64,${base64}`; });
}

/* ═══ MACRO BAR ═══════════════════════════════════════════════════════════ */
function MacroBar({ totals, compact=false, S, t }) {
  if(!totals) return null;
  const { calories=0, protein=0, carbs=0, fat=0, fibre=0 } = totals;
  const total=protein+carbs+fat; if(!total) return null;
  const pP=Math.round(protein/total*100), cP=Math.round(carbs/total*100), fP=Math.round(fat/total*100);
  if(compact) return (
    <div style={{marginTop:4}}>
      <div style={{display:"flex",height:4,borderRadius:2,overflow:"hidden",gap:1}}>
        <div style={{width:`${pP}%`,background:"#f4845f",borderRadius:2}}/>
        <div style={{width:`${cP}%`,background:"#f6c954",borderRadius:2}}/>
        <div style={{width:`${fP}%`,background:S.accent,borderRadius:2}}/>
      </div>
      <div style={{display:"flex",gap:5,marginTop:3}}>
        <span style={{fontSize:9,color:"#f4845f"}}>{protein}g P</span>
        <span style={{fontSize:9,color:"#f6c954"}}>{carbs}g C</span>
        <span style={{fontSize:9,color:S.accent}}>{fat}g F</span>
        {fibre>0&&<span style={{fontSize:9,color:S.blue}}>{fibre}g Fi</span>}
      </div>
    </div>
  );
  return (
    <div style={{background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"12px 14px",border:`1px solid ${S.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{fontSize:10,color:S.textMuted,textTransform:"uppercase",letterSpacing:1}}>{t.nutritionEstimate}</div>
        <div style={{fontSize:14,fontWeight:700,color:S.text,fontFamily:"monospace"}}>{calories} <span style={{fontSize:10,fontWeight:400,color:S.textMuted}}>{t.kcal}</span></div>
      </div>
      <div style={{display:"flex",height:8,borderRadius:4,overflow:"hidden",marginBottom:10,gap:1}}>
        <div style={{width:`${pP}%`,background:"#f4845f",borderRadius:4,transition:"width 0.5s"}}/>
        <div style={{width:`${cP}%`,background:"#f6c954",borderRadius:4,transition:"width 0.5s"}}/>
        <div style={{width:`${fP}%`,background:S.accent,borderRadius:4,transition:"width 0.5s"}}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6}}>
        {[[t.protein,protein,"#f4845f"],[t.carbs,carbs,"#f6c954"],[t.fat,fat,S.accent],[t.fibre,fibre,S.blue]].map(([lbl,val,col])=>(
          <div key={lbl} style={{textAlign:"center",background:"rgba(255,255,255,0.03)",borderRadius:8,padding:"6px 4px"}}>
            <div style={{fontSize:15,fontWeight:700,color:col,fontFamily:"monospace",lineHeight:1}}>{val}</div>
            <div style={{fontSize:9,color:S.textMuted,marginTop:2,textTransform:"uppercase",letterSpacing:0.5}}>{lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ MOCK AI DATA ════════════════════════════════════════════════════════ */
const MOCK = {
  breakfast:       { description:"A warm bowl of oatmeal topped with sliced banana, honey, and black coffee.", ingredients:[{name:"Oatmeal (80g)",calories:297,protein:10,carbs:51,fat:5,fibre:8},{name:"Banana (1 medium)",calories:89,protein:1,carbs:23,fat:0,fibre:3},{name:"Honey (1 tsp)",calories:21,protein:0,carbs:6,fat:0,fibre:0},{name:"Black coffee",calories:2,protein:0,carbs:0,fat:0,fibre:0}], totals:{calories:409,protein:11,carbs:80,fat:5,fibre:11} },
  morning_snack:   { description:"Greek yogurt with mixed berries and a sprinkle of granola.", ingredients:[{name:"Greek yogurt (150g)",calories:130,protein:17,carbs:7,fat:4,fibre:0},{name:"Mixed berries (80g)",calories:40,protein:1,carbs:9,fat:0,fibre:2},{name:"Granola (20g)",calories:90,protein:2,carbs:14,fat:3,fibre:1}], totals:{calories:260,protein:20,carbs:30,fat:7,fibre:3} },
  lunch:           { description:"Two soft flour tacos with grilled chicken, mushrooms, red peppers, cheese and lettuce.", ingredients:[{name:"Flour tortillas (2)",calories:180,protein:5,carbs:32,fat:4,fibre:2},{name:"Grilled chicken (120g)",calories:185,protein:35,carbs:0,fat:4,fibre:0},{name:"Sautéed mushrooms",calories:30,protein:2,carbs:4,fat:1,fibre:1},{name:"Roasted red peppers",calories:25,protein:1,carbs:5,fat:0,fibre:1},{name:"Shredded cheese (25g)",calories:100,protein:6,carbs:1,fat:8,fibre:0},{name:"Lettuce",calories:5,protein:0,carbs:1,fat:0,fibre:0}], totals:{calories:525,protein:49,carbs:43,fat:17,fibre:4} },
  afternoon_snack: { description:"A medium apple and a handful of raw almonds.", ingredients:[{name:"Apple (1 medium)",calories:95,protein:0,carbs:25,fat:0,fibre:4},{name:"Almonds (25g)",calories:144,protein:5,carbs:5,fat:13,fibre:2}], totals:{calories:239,protein:5,carbs:30,fat:13,fibre:6} },
  dinner:          { description:"Pan-seared salmon with roasted vegetables and quinoa.", ingredients:[{name:"Salmon fillet (180g)",calories:350,protein:40,carbs:0,fat:20,fibre:0},{name:"Roasted courgette",calories:30,protein:2,carbs:5,fat:0,fibre:1},{name:"Roasted peppers",calories:25,protein:1,carbs:5,fat:0,fibre:1},{name:"Quinoa (120g cooked)",calories:180,protein:7,carbs:32,fat:3,fibre:3},{name:"Olive oil (1 tbsp)",calories:119,protein:0,carbs:0,fat:14,fibre:0}], totals:{calories:704,protein:50,carbs:42,fat:37,fibre:5} },
  evening_snack:   { description:"Low-fat cottage cheese with fresh pineapple chunks.", ingredients:[{name:"Cottage cheese (200g)",calories:160,protein:24,carbs:6,fat:4,fibre:0},{name:"Pineapple (80g)",calories:42,protein:0,carbs:11,fat:0,fibre:1}], totals:{calories:202,protein:24,carbs:17,fat:4,fibre:1} },
};

async function analyzeImage(base64,mediaType,slotId) {
  if(IS_DEMO){ await new Promise(r=>setTimeout(r,1200)); return MOCK[slotId]||{description:"A balanced meal.",ingredients:[{name:"Mixed ingredients",calories:400,protein:20,carbs:40,fat:15,fibre:4}],totals:{calories:400,protein:20,carbs:40,fat:15,fibre:4}}; }
  try {
    const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({base64,mediaType})});
    if(!res.ok) throw new Error("API error");
    return await res.json();
  } catch(e){ console.error(e); return{description:"",ingredients:[],totals:{calories:0,protein:0,carbs:0,fat:0,fibre:0}}; }
}

/* ═══ STORAGE ════════════════════════════════════════════════════════════ */
const USERS_KEY="tracky-users-v2";
function loadUsers()         { try{return JSON.parse(localStorage.getItem(USERS_KEY)||"[]");}catch{return[];} }
function saveUsers(u)        { try{localStorage.setItem(USERS_KEY, JSON.stringify(u));}catch{} }
function loadUserData(uid)   { try{return JSON.parse(localStorage.getItem(`tracky-d-${uid}`)||"{}");}catch{return{};} }
function saveUserData(uid,d) { try{localStorage.setItem(`tracky-d-${uid}`, JSON.stringify(d));}catch{} }

/* ═══ WORDMARK ═══════════════════════════════════════════════════════════ */
function Wordmark({ S, size=28 }) {
  return (
    <span style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:800,fontSize:size,letterSpacing:size>30?-2:-1,lineHeight:1,color:S.text}}>
      Tracky<span style={{color:S.accent}}>.</span>
    </span>
  );
}

/* ═══ SETTINGS MODAL ════════════════════════════════════════════════════ */
function SettingsModal({ user, S, lang, skinId, onSave, onClose }) {
  const [selLang,setSelLang]=useState(lang);
  const [selSkin,setSelSkin]=useState(skinId);
  const t=T[selLang]; const PS=SKINS[selSkin];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding:16}} onClick={onClose}>
      <div style={{background:S.card,borderRadius:20,width:"100%",maxWidth:380,padding:"22px 20px 26px",border:`1px solid ${S.border}`}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <Wordmark S={PS} size={22}/>
          <div style={{fontSize:13,color:S.textMuted}}>{user.name}</div>
        </div>
        {/* Language */}
        <div style={{marginBottom:18}}>
          <div style={{fontSize:10,color:S.textMuted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>{t.language}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[["en","🇺🇸 English"],["es","🇦🇷 Español"]].map(([code,label])=>(
              <button key={code} onClick={()=>setSelLang(code)} style={{padding:"11px 0",borderRadius:11,border:`1px solid ${selLang===code?PS.accentBorder:S.border}`,background:selLang===code?PS.accentDim:"transparent",color:selLang===code?PS.accent:S.textMuted,fontSize:13,fontWeight:selLang===code?600:400,cursor:"pointer",transition:"all 0.15s"}}>{label}</button>
            ))}
          </div>
        </div>
        {/* Skin */}
        <div style={{marginBottom:22}}>
          <div style={{fontSize:10,color:S.textMuted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>{t.skin}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {Object.values(SKINS).map(sk=>(
              <button key={sk.id} onClick={()=>setSelSkin(sk.id)} style={{padding:"11px 12px",borderRadius:11,border:`1px solid ${selSkin===sk.id?sk.accentBorder:S.border}`,background:selSkin===sk.id?sk.accentDim:"transparent",cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all 0.15s"}}>
                <div style={{width:16,height:16,borderRadius:"50%",background:sk.accent,flexShrink:0,boxShadow:selSkin===sk.id?`0 0 8px ${sk.accent}60`:"none"}}/>
                <span style={{fontSize:11,fontWeight:selSkin===sk.id?600:400,color:selSkin===sk.id?sk.accent:S.textMuted}}>{lang==="es"?sk.nameEs:sk.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>onSave(selLang,selSkin)} style={{flex:1,background:PS.accent,color:PS.bg,border:"none",borderRadius:11,padding:"12px 0",fontSize:13,fontWeight:700,cursor:"pointer"}}>{t.save}</button>
          <button onClick={onClose} style={{padding:"12px 16px",background:S.surface,color:S.textMuted,border:`1px solid ${S.border}`,borderRadius:11,fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══ INGREDIENT EDITOR ═════════════════════════════════════════════════ */
function IngredientEditor({ photo, onConfirm, onCancel, S, t }) {
  const [description,setDescription]=useState(photo.description||"");
  const [ingredients,setIngredients]=useState(photo.ingredients||[]);
  const [editIdx,setEditIdx]=useState(null);
  const [editVal,setEditVal]=useState({});
  const [newName,setNewName]=useState("");
  const [lookingUp,setLookingUp]=useState(false);
  const inputRef=useRef();

  const liveIngredients=editIdx!==null?ingredients.map((v,i)=>i===editIdx?{...v,...editVal}:v):ingredients;
  const totals=liveIngredients.reduce((a,i)=>({calories:a.calories+(i.calories||0),protein:a.protein+(i.protein||0),carbs:a.carbs+(i.carbs||0),fat:a.fat+(i.fat||0),fibre:a.fibre+(i.fibre||0)}),{calories:0,protein:0,carbs:0,fat:0,fibre:0});
  const removeItem=i=>setIngredients(p=>p.filter((_,j)=>j!==i));
  const startEdit=i=>{setEditIdx(i);setEditVal({...ingredients[i]});};
  const commitEdit=()=>{const parsed={...editVal,calories:parseInt(editVal.calories)||0,protein:parseInt(editVal.protein)||0,carbs:parseInt(editVal.carbs)||0,fat:parseInt(editVal.fat)||0,fibre:parseInt(editVal.fibre)||0};setIngredients(p=>p.map((v,i)=>i===editIdx?{...v,...parsed}:v));setEditIdx(null);};
  const addItem=async()=>{
    if(!newName.trim())return;
    const name=newName.trim(); setNewName(""); setLookingUp(true);
    try {
      const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:name})});
      const data=await res.json();
      const ing=data.ingredients?.[0]||{name,calories:0,protein:0,carbs:0,fat:0,fibre:0};
      setIngredients(p=>[...p,{...ing,name}]);
      setEditIdx(ingredients.length); setEditVal({...ing,name});
    } catch(e){
      setIngredients(p=>[...p,{name,calories:0,protein:0,carbs:0,fat:0,fibre:0}]);
      setEditIdx(ingredients.length); setEditVal({name,calories:0,protein:0,carbs:0,fat:0,fibre:0});
    } finally { setLookingUp(false); inputRef.current?.focus(); }
  };
  const previewUrl=photo.imageUrl||(photo.base64?`data:${photo.mediaType||"image/jpeg"};base64,${photo.base64}`:null);

  const NumInput=({label,field,color})=>(
    <div style={{textAlign:"center"}}>
      <input type="number" min="0" value={editVal[field]===undefined?0:editVal[field]} onChange={e=>setEditVal(v=>({...v,[field]:e.target.value===" "?" ":Number(e.target.value)||0}))} onBlur={e=>setEditVal(v=>({...v,[field]:parseInt(e.target.value)||0}))}
        style={{width:"100%",background:"rgba(255,255,255,0.07)",border:`1px solid ${color}44`,borderRadius:7,padding:"5px 4px",color,fontSize:13,fontFamily:"monospace",outline:"none",textAlign:"center"}}/>
      <div style={{fontSize:9,color:S.textMuted,marginTop:2,textTransform:"uppercase"}}>{label}</div>
    </div>
  );

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:12}}>
      <div style={{background:S.card,borderRadius:20,width:"100%",maxWidth:500,maxHeight:"96vh",overflow:"auto",border:`1px solid ${S.accentBorder}`,boxShadow:"0 24px 64px rgba(0,0,0,0.7)"}}>
        {/* Photo header */}
        <div style={{position:"relative",height:155,overflow:"hidden",borderRadius:"20px 20px 0 0",flexShrink:0}}>
          {previewUrl?<img src={previewUrl} alt="meal" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",background:S.accentDim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}>🍽</div>}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0) 30%,rgba(0,0,0,0.92) 100%)"}}/>
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:5,height:5,borderRadius:"50%",background:S.accent,boxShadow:`0 0 6px ${S.accent}`}}/><div style={{fontSize:9,color:S.accent,textTransform:"uppercase",letterSpacing:2}}>{IS_DEMO?t.demoAiAnalysis:t.aiAnalysis}</div></div>
            <div><div style={{fontSize:22,fontWeight:700,color:S.text,fontFamily:"monospace",lineHeight:1}}>{totals.calories}</div><div style={{fontSize:9,color:"rgba(255,255,255,0.4)",textAlign:"right"}}>{t.kcalTotal}</div></div>
          </div>
        </div>
        <div style={{padding:"14px 16px 22px"}}>
          {IS_DEMO&&<div style={{background:"rgba(255,180,80,0.07)",border:"1px solid rgba(255,180,80,0.2)",borderRadius:8,padding:"6px 10px",marginBottom:12,fontSize:11,color:"rgba(255,180,80,0.7)",display:"flex",gap:6,alignItems:"center"}}>🧪 {t.demoMode}</div>}
          {/* Description */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10,color:S.textMuted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{t.description}</div>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={2}
              style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${S.border}`,borderRadius:9,padding:"9px 11px",color:"rgba(255,255,255,0.7)",fontSize:12,lineHeight:1.5,resize:"none",fontFamily:"'DM Sans',sans-serif",outline:"none"}}
              onFocus={e=>e.target.style.borderColor=S.accentBorder} onBlur={e=>e.target.style.borderColor=S.border}/>
          </div>
          {/* Live macro bar */}
          <div style={{marginBottom:14}}><MacroBar totals={totals} S={S} t={t}/></div>
          {/* Ingredients */}
          <div style={{marginBottom:10}}>
            <div style={{fontSize:10,color:S.textMuted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>{t.ingredients} <span style={{textTransform:"none",letterSpacing:0,color:"rgba(255,255,255,0.15)"}}>— {t.tapToRename}</span></div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {ingredients.map((ing,i)=>editIdx===i?(
                <div key={i} style={{background:S.accentDim,border:`1px solid ${S.accentBorder}`,borderRadius:10,padding:"10px 12px"}}>
                  <input value={editVal.name||""} onChange={e=>setEditVal(v=>({...v,name:e.target.value}))} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:`1px solid ${S.border}`,borderRadius:7,padding:"6px 10px",color:S.text,fontSize:13,outline:"none",marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}/>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:8}}>
                    <NumInput label={t.kcal} field="calories" color={S.text}/>
                    <NumInput label={t.prot} field="protein"  color="#f4845f"/>
                    <NumInput label={t.carb} field="carbs"    color="#f6c954"/>
                    <NumInput label={t.fat}  field="fat"      color={S.accent}/>
                    <NumInput label={t.fibre}field="fibre"    color={S.blue}/>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={commitEdit} style={{flex:1,background:S.accent,color:S.bg,border:"none",borderRadius:7,padding:"7px 0",fontSize:12,fontWeight:700,cursor:"pointer"}}>✓ {t.save}</button>
                    <button onClick={()=>setEditIdx(null)} style={{padding:"7px 12px",background:"rgba(255,255,255,0.04)",color:S.textMuted,border:`1px solid ${S.border}`,borderRadius:7,fontSize:12,cursor:"pointer"}}>{t.cancel}</button>
                  </div>
                </div>
              ):(
                <div key={i} onClick={()=>startEdit(i)} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.03)",border:`1px solid ${S.border}`,borderRadius:9,padding:"8px 11px",cursor:"pointer",transition:"all 0.15s"}}
                  onMouseOver={e=>e.currentTarget.style.background=S.accentDim}
                  onMouseOut={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,color:S.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ing.name}</div>
                    <div style={{display:"flex",gap:8,marginTop:2,fontSize:10}}>
                      <span style={{color:S.textMuted,fontFamily:"monospace"}}>{ing.calories} {t.kcal}</span>
                      <span style={{color:"#f4845f"}}>{ing.protein}g P</span>
                      <span style={{color:"#f6c954"}}>{ing.carbs}g C</span>
                      <span style={{color:S.accent}}>{ing.fat}g F</span>
                      {ing.fibre>0&&<span style={{color:S.blue}}>{ing.fibre}g Fi</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:4,flexShrink:0}}>
                    <span style={{fontSize:10,color:S.textMuted,padding:"2px 6px",border:`1px solid ${S.border}`,borderRadius:6}}>edit</span>
                    <span onClick={ev=>{ev.stopPropagation();removeItem(i);}} style={{fontSize:14,color:"rgba(255,100,100,0.35)",cursor:"pointer",padding:"0 4px",lineHeight:"20px"}} onMouseOver={e=>e.currentTarget.style.color="rgba(255,100,100,0.7)"} onMouseOut={e=>e.currentTarget.style.color="rgba(255,100,100,0.35)"}>×</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:7,marginBottom:16}}>
            <input ref={inputRef} value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addItem();}}} placeholder={lookingUp?"Looking up…":t.addIngredient} disabled={lookingUp}
              style={{flex:1,background:"rgba(255,255,255,0.04)",border:`1px solid ${S.border}`,borderRadius:9,padding:"8px 12px",color:S.text,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif"}}
              onFocus={e=>e.target.style.borderColor=S.accentBorder} onBlur={e=>e.target.style.borderColor=S.border}/>
            <button onClick={addItem} disabled={lookingUp} style={{background:S.accentDim,border:`1px solid ${S.accentBorder}`,color:lookingUp?S.textMuted:S.accent,borderRadius:9,padding:"8px 14px",fontSize:16,cursor:lookingUp?"default":"pointer",fontWeight:700}}>{lookingUp?"…":"+"}</button>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>onConfirm({...photo,description,ingredients,totals})} style={{flex:1,background:S.accent,color:S.bg,border:"none",borderRadius:11,padding:"12px 0",fontSize:14,fontWeight:700,cursor:"pointer"}}>{t.confirmSave}</button>
            <button onClick={onCancel} style={{padding:"12px 14px",background:"rgba(255,255,255,0.04)",color:S.textMuted,border:`1px solid ${S.border}`,borderRadius:11,fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ AUTH ═══════════════════════════════════════════════════════════════ */
function AuthScreen({ onLogin }) {
  const [mode,setMode]=useState("pick");
  const [users,setUsers]=useState(()=>loadUsers());
  const [name,setName]=useState(""); const [pin,setPin]=useState("");
  const [selUser,setSelUser]=useState(null); const [err,setErr]=useState("");
  const [selLang,setSelLang]=useState("en"); const [selSkin,setSelSkin]=useState("green");
  const S=SKINS[selSkin]; const t=T[selLang];
  const doLogin=()=>{ if(pin.length!==4){setErr(t.pinDigits);return;} if(selUser.pin!==pin){setErr("Wrong PIN");setPin("");return;} onLogin(selUser); };
  const doSignup=()=>{ if(!name.trim()){setErr(t.enterName);return;} if(pin.length!==4){setErr(t.pinDigits);return;} if(users.find(u=>u.name.toLowerCase()===name.trim().toLowerCase())){setErr(t.nameTaken);return;} const nu={id:Date.now().toString(),name:name.trim(),pin,lang:selLang,skin:selSkin,createdAt:new Date().toISOString()}; const up=[...users,nu]; saveUsers(up); setUsers(up); onLogin(nu); };
  const pressPin=k=>{if(k==="⌫"){setPin(p=>p.slice(0,-1));setErr("");}else if(pin.length<4)setPin(p=>p+k);};
  const PinDots=({v})=>(<div style={{display:"flex",gap:14,justifyContent:"center",margin:"18px 0"}}>{[0,1,2,3].map(i=><div key={i} style={{width:13,height:13,borderRadius:"50%",background:i<v.length?S.accent:S.border,transition:"background 0.15s",boxShadow:i<v.length?`0 0 8px ${S.accent}50`:"none"}}/>)}</div>);
  const Numpad=()=>(<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,maxWidth:230,margin:"0 auto"}}>{[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=>(<button key={i} onClick={()=>k!==""&&pressPin(String(k))} style={{padding:"14px 0",fontSize:k==="⌫"?16:20,background:k===""?"transparent":S.surface,border:k===""?"none":`1px solid ${S.border}`,borderRadius:12,color:S.text,cursor:k===""?"default":"pointer",transition:"background 0.1s"}} onMouseOver={e=>{if(k!=="")e.currentTarget.style.background=S.accentDim;}} onMouseOut={e=>{if(k!=="")e.currentTarget.style.background=S.surface;}}>{k}</button>))}</div>);
  const SkinDots=()=>(<div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}>{Object.values(SKINS).map(sk=><button key={sk.id} onClick={()=>setSelSkin(sk.id)} style={{width:26,height:26,borderRadius:"50%",background:sk.accent,border:selSkin===sk.id?`3px solid ${S.text}`:`2px solid transparent`,cursor:"pointer",transition:"all 0.2s",boxShadow:selSkin===sk.id?`0 0 10px ${sk.accent}60`:"none"}}/>)}</div>);
  const LangToggle=()=>(<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>{[["en","🇺🇸 English"],["es","🇦🇷 Español"]].map(([code,label])=><button key={code} onClick={()=>setSelLang(code)} style={{padding:"8px 0",borderRadius:10,border:`1px solid ${selLang===code?S.accentBorder:S.border}`,background:selLang===code?S.accentDim:"transparent",color:selLang===code?S.accent:S.textMuted,fontSize:12,cursor:"pointer",transition:"all 0.15s"}}>{label}</button>)}</div>);


  return (
    <div style={{minHeight:"100vh",background:S.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20,fontFamily:"'DM Sans',sans-serif",transition:"background 0.4s"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');*{box-sizing:border-box}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      <div style={{width:"100%",maxWidth:380,animation:"fadeUp 0.4s ease"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <Wordmark S={S} size={42}/>
          <div style={{fontSize:11,color:S.textMuted,marginTop:5,letterSpacing:1}}>{t.appTagline}</div>
          {IS_DEMO&&<div style={{marginTop:10,fontSize:11,color:"rgba(255,180,80,0.65)",background:"rgba(255,180,80,0.07)",border:"1px solid rgba(255,180,80,0.15)",borderRadius:8,padding:"5px 12px",display:"inline-block"}}>🧪 {t.demoTag}</div>}
        </div>

        {mode==="pick"&&<div>
          <LangToggle/><SkinDots/>
          {users.length>0&&<>
            <div style={{fontSize:10,color:S.textMuted,textTransform:"uppercase",letterSpacing:2,marginBottom:12,textAlign:"center"}}>{t.whoAreYou}</div>
            <div style={{display:"grid",gap:8,marginBottom:16}}>
              {users.map(u=>{
                const uS=SKINS[u.skin||"green"];
                return <button key={u.id} onClick={()=>{setSelUser(u);setMode("login");setPin("");setErr("");setSelLang(u.lang||"en");setSelSkin(u.skin||"green");}}
                  style={{background:S.surface,border:`1px solid ${S.border}`,borderRadius:14,padding:"13px 16px",color:S.text,fontSize:15,cursor:"pointer",textAlign:"left",fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,display:"flex",alignItems:"center",gap:12,transition:"all 0.15s"}}
                  onMouseOver={e=>e.currentTarget.style.background=S.accentDim} onMouseOut={e=>e.currentTarget.style.background=S.surface}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:uS.accentDim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:uS.accent,fontWeight:700,flexShrink:0,border:`2px solid ${uS.accent}55`}}>{u.name[0].toUpperCase()}</div>
                  <div style={{flex:1}}>{u.name}</div>
                  <div style={{width:10,height:10,borderRadius:"50%",background:uS.accent,opacity:0.7}}/>
                </button>;
              })}
            </div>
            <div style={{textAlign:"center",marginBottom:12,color:"rgba(255,255,255,0.15)",fontSize:12}}>— {t.or} —</div>
          </>}
          <button onClick={()=>{setMode("signup");setPin("");setName("");setErr("");}} style={{width:"100%",background:S.accentDim,border:`1px solid ${S.accentBorder}`,borderRadius:14,padding:"13px 0",color:S.accent,fontSize:14,fontWeight:600,cursor:"pointer"}}>+ {t.createAccount}</button>
        </div>}

        {mode==="login"&&<div style={{textAlign:"center"}}>
          <div style={{width:48,height:48,borderRadius:"50%",background:S.accentDim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:S.accent,fontWeight:700,margin:"0 auto 12px",border:`2px solid ${S.accent}55`}}>{selUser?.name[0].toUpperCase()}</div>
          <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:16,color:S.text,marginBottom:2}}>{t.welcomeBack}</div>
          <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:26,fontWeight:800,color:S.accent,marginBottom:2}}>{selUser?.name}</div>
          <div style={{fontSize:12,color:S.textMuted,marginBottom:2}}>{t.enterPin}</div>
          <PinDots v={pin}/>{err&&<div style={{fontSize:12,color:"#ff8a8a",marginBottom:8}}>{err}</div>}<Numpad/>
          <div style={{display:"flex",gap:10,marginTop:16}}>
            <button onClick={doLogin} disabled={pin.length!==4} style={{flex:1,background:pin.length===4?S.accent:S.surface,color:pin.length===4?S.bg:"rgba(255,255,255,0.25)",border:"none",borderRadius:12,padding:"12px 0",fontSize:14,fontWeight:700,cursor:pin.length===4?"pointer":"default",transition:"all 0.2s"}}>{t.unlock}</button>
            <button onClick={()=>{setMode("pick");setPin("");setErr("");}} style={{padding:"12px 14px",background:S.surface,color:S.textMuted,border:`1px solid ${S.border}`,borderRadius:12,fontSize:13,cursor:"pointer"}}>{t.back}</button>
          </div>
        </div>}

        {mode==="signup"&&<div style={{textAlign:"center"}}>
          <LangToggle/><SkinDots/>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder={t.yourName}
            style={{width:"100%",background:S.surface,border:`1px solid ${S.border}`,borderRadius:12,padding:"12px 16px",color:S.text,fontSize:16,fontFamily:"'Plus Jakarta Sans',sans-serif",fontWeight:700,outline:"none",marginBottom:16,textAlign:"center"}}/>
          <div style={{fontSize:12,color:S.textMuted,marginBottom:2}}>{t.choosePin}</div>
          <PinDots v={pin}/>{err&&<div style={{fontSize:12,color:"#ff8a8a",marginBottom:8}}>{err}</div>}<Numpad/>
          <div style={{display:"flex",gap:10,marginTop:16}}>
            <button onClick={doSignup} disabled={pin.length!==4||!name.trim()} style={{flex:1,background:pin.length===4&&name.trim()?S.accent:S.surface,color:pin.length===4&&name.trim()?S.bg:"rgba(255,255,255,0.25)",border:"none",borderRadius:12,padding:"12px 0",fontSize:14,fontWeight:700,cursor:pin.length===4&&name.trim()?"pointer":"default",transition:"all 0.2s"}}>{t.createAccount}</button>
            <button onClick={()=>{setMode("pick");setPin("");setErr("");}} style={{padding:"12px 14px",background:S.surface,color:S.textMuted,border:`1px solid ${S.border}`,borderRadius:12,fontSize:13,cursor:"pointer"}}>{t.back}</button>
          </div>
        </div>}
      </div>
    </div>
  );
}

/* ═══ MEAL MODAL ═════════════════════════════════════════════════════════ */
function MealModal({ slot, entry, onSave, onClose, isBackfill, S, t }) {
  const [photos,setPhotos]=useState(entry?.photos||[]);
  const [notes,setNotes]=useState(entry?.notes||"");
  const [timestamp,setTimestamp]=useState(entry?.timestamp||"");
  const [analyzing,setAnalyzing]=useState(false);
  const [pendingPhoto,setPendingPhoto]=useState(null);
  const fileRef=useRef();
  useEffect(()=>{ if(!timestamp){if(isBackfill)setTimestamp(`${String(slot.rH).padStart(2,"0")}:${String(slot.rM).padStart(2,"0")}`);else setTimestamp(new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",hour12:false}));} },[]);
  const handleFiles=async(files)=>{ const arr=Array.from(files).filter(f=>f.type.startsWith("image/")); if(!arr.length)return; for(const file of arr){ setAnalyzing(true); const rawB64=await toBase64(file); const [resized,analysis]=await Promise.all([resizeImage(rawB64,file.type),analyzeImage(rawB64,file.type,slot.id)]); setAnalyzing(false); await new Promise(resolve=>setPendingPhoto({imageUrl:URL.createObjectURL(file),base64:resized,mediaType:"image/jpeg",...analysis,_resolve:resolve})); } };
  const handleConfirm=confirmed=>{ const{_resolve,...photo}=confirmed; setPhotos(p=>[...p,photo]); setPendingPhoto(null); _resolve(); };
  const handleCancel=()=>{ const{_resolve}=pendingPhoto; setPendingPhoto(null); _resolve(); };
  const mealTotals=photos.reduce((a,p)=>{ const tt=p.totals||{}; return{calories:a.calories+(tt.calories||0),protein:a.protein+(tt.protein||0),carbs:a.carbs+(tt.carbs||0),fat:a.fat+(tt.fat||0),fibre:a.fibre+(tt.fibre||0)}; },{calories:0,protein:0,carbs:0,fat:0,fibre:0});
  const allFoods=[...new Set(photos.flatMap(p=>(p.ingredients||[]).map(i=>i.name)))];
  const handleSave=()=>{ if(!photos.length&&!notes.trim()){onSave(null);onClose();return;} const toStore=photos.map(p=>({base64:p.base64,mediaType:p.mediaType||"image/jpeg",description:p.description,ingredients:p.ingredients,totals:p.totals})); onSave({photos:toStore,notes,foods:allFoods,ingredients:photos.flatMap(p=>p.ingredients||[]),totals:mealTotals,timestamp,status:"done"}); onClose(); };
  const previews=photos.map(p=>({...p,previewUrl:p.imageUrl||(p.base64?`data:${p.mediaType||"image/jpeg"};base64,${p.base64}`:null)}));
  return (
    <>{pendingPhoto&&<IngredientEditor photo={pendingPhoto} onConfirm={handleConfirm} onCancel={handleCancel} S={S} t={t}/>}
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:200}} onClick={onClose}>
      <div style={{background:S.card,borderRadius:"22px 22px 0 0",width:"100%",maxWidth:560,maxHeight:"90vh",overflow:"auto",padding:"18px 18px 36px"}} onClick={e=>e.stopPropagation()}>
        <div style={{width:36,height:4,background:"rgba(255,255,255,0.12)",borderRadius:2,margin:"0 auto 16px"}}/>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <span style={{fontSize:20}}>{slot.icon}</span>
          <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:18,fontWeight:800,color:S.text,flex:1}}>{slot.label}</div>
          {isBackfill&&<div style={{fontSize:10,color:S.orange,background:"rgba(255,180,80,0.1)",border:"1px solid rgba(255,180,80,0.2)",borderRadius:20,padding:"2px 8px"}}>{t.pastEntry}</div>}
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:10,color:S.textMuted,textTransform:"uppercase",letterSpacing:1,marginBottom:5}}>{t.timeLogged}</div>
          <input type="time" value={timestamp} onChange={e=>setTimestamp(e.target.value)} style={{background:S.surface,border:`1px solid ${S.border}`,borderRadius:10,padding:"9px 12px",color:S.accent,fontSize:14,fontFamily:"monospace",outline:"none",colorScheme:"dark",width:"100%"}}/>
        </div>
        {previews.length>0&&<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
          {previews.map((p,i)=><div key={i} style={{position:"relative",borderRadius:10,overflow:"hidden",aspectRatio:"1"}}>
            {p.previewUrl&&<img src={p.previewUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
            <button onClick={()=>setPhotos(ps=>ps.filter((_,j)=>j!==i))} style={{position:"absolute",top:4,right:4,background:"rgba(0,0,0,0.65)",border:"none",color:"#fff",borderRadius:"50%",width:20,height:20,fontSize:11,cursor:"pointer",lineHeight:"20px",textAlign:"center",padding:0}}>×</button>
            {p.totals?.calories&&<div style={{position:"absolute",bottom:0,left:0,right:0,background:"rgba(0,0,0,0.65)",padding:"2px 5px",fontSize:9,color:S.accent,fontFamily:"monospace",textAlign:"center"}}>{p.totals.calories} kcal</div>}
          </div>)}
          <div onClick={()=>!analyzing&&fileRef.current.click()} style={{borderRadius:10,border:`1.5px dashed ${S.border}`,aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:S.textMuted,flexDirection:"column",gap:3,fontSize:11}}>
            <span style={{fontSize:20}}>+</span><span>Add</span>
          </div>
        </div>}
        {previews.length===0&&<div onClick={()=>!analyzing&&fileRef.current.click()} style={{border:`1.5px dashed ${S.border}`,borderRadius:14,padding:"24px 0",textAlign:"center",cursor:analyzing?"default":"pointer",marginBottom:12,color:S.textMuted}}>
          {analyzing?<><div style={{fontSize:12,color:S.accent,display:"flex",alignItems:"center",justifyContent:"center",gap:7,marginBottom:5}}><div style={{width:7,height:7,borderRadius:"50%",background:S.accent,animation:"blink 1s infinite"}}/>{t.analyzing}{IS_DEMO?" (demo)":""}…</div><div style={{fontSize:11,opacity:0.5}}>{t.analyzeHint}</div></>:<><div style={{fontSize:26,marginBottom:6}}>📷</div><div style={{fontSize:13}}>{t.addPhotos}</div></>}
        </div>}
        {analyzing&&previews.length>0&&<div style={{fontSize:12,color:S.accent,marginBottom:10,display:"flex",alignItems:"center",gap:7}}><div style={{width:7,height:7,borderRadius:"50%",background:S.accent,animation:"blink 1s infinite"}}/>{t.analyzing}…</div>}
        <input ref={fileRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>handleFiles(e.target.files)}/>
        {mealTotals.calories>0&&<div style={{marginBottom:14}}><MacroBar totals={mealTotals} S={S} t={t}/></div>}
        <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder={t.notes} style={{width:"100%",background:S.surface,border:`1px solid ${S.border}`,borderRadius:10,padding:"10px 12px",color:S.text,fontSize:13,lineHeight:1.6,resize:"vertical",minHeight:52,fontFamily:"'DM Sans',sans-serif",outline:"none",marginBottom:14}}/>
        <div style={{display:"flex",gap:8}}>
          <button onClick={handleSave} style={{flex:1,background:S.accent,color:S.bg,border:"none",borderRadius:11,padding:"12px 0",fontSize:13,fontWeight:700,cursor:"pointer"}}>{t.save}</button>
          <button onClick={onClose} style={{padding:"12px 16px",background:S.surface,color:S.textMuted,border:`1px solid ${S.border}`,borderRadius:11,fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
        </div>
      </div>
    </div></>
  );
}

/* ═══ DAILY STATS ════════════════════════════════════════════════════════ */
function DailyStats({ stats, onChange, readOnly, S, t }) {
  const [open,setOpen]=useState(null); const [w,setW]=useState(stats?.workout||{}); const [weight,setWeight]=useState(stats?.weight||"");
  useEffect(()=>{ setW(stats?.workout||{}); setWeight(stats?.weight||""); },[stats]);
  const save=()=>{ onChange({workout:w,weight}); setOpen(null); };
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:"flex",gap:10}}>
        <div onClick={()=>!readOnly&&setOpen("weight")} style={{flex:1,background:stats?.weight?`${S.blue}15`:S.surface,border:stats?.weight?`1px solid ${S.blue}44`:`1px solid ${S.border}`,borderRadius:13,padding:"12px 13px",cursor:readOnly?"default":"pointer",transition:"all 0.2s"}}>
          <div style={{fontSize:10,color:S.textMuted,marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>{t.weight}</div>
          {stats?.weight?<div style={{fontSize:19,fontWeight:700,color:S.blue,fontFamily:"monospace"}}>{stats.weight}<span style={{fontSize:11,fontWeight:400,opacity:0.5,marginLeft:4}}>{t.kg}</span></div>:<div style={{fontSize:12,color:S.textMuted}}>⚖️{!readOnly&&` ${t.logWeight}`}</div>}
        </div>
        <div onClick={()=>!readOnly&&setOpen("workout")} style={{flex:2,background:stats?.workout?.type?"rgba(255,180,80,0.08)":S.surface,border:stats?.workout?.type?"1px solid rgba(255,180,80,0.2)":`1px solid ${S.border}`,borderRadius:13,padding:"12px 13px",cursor:readOnly?"default":"pointer",transition:"all 0.2s"}}>
          <div style={{fontSize:10,color:S.textMuted,marginBottom:3,textTransform:"uppercase",letterSpacing:1}}>{t.workout}</div>
          {stats?.workout?.type?<div><div style={{fontSize:14,fontWeight:600,color:S.orange}}>{stats.workout.type}</div><div style={{fontSize:11,color:"rgba(255,180,80,0.5)",marginTop:1}}>{stats.workout.duration&&`${stats.workout.duration}min`}{stats.workout.time&&` · ${stats.workout.time}`}{stats.workout.intensity&&` · ${stats.workout.intensity}`}</div></div>:<div style={{fontSize:12,color:S.textMuted}}>🏋️{!readOnly&&` ${t.logWorkout}`}</div>}
        </div>
      </div>
      {open==="weight"&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:20}} onClick={()=>setOpen(null)}>
        <div style={{background:S.card,borderRadius:20,padding:26,width:"100%",maxWidth:310,border:`1px solid ${S.border}`}} onClick={e=>e.stopPropagation()}>
          <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:18,fontWeight:800,color:S.text,marginBottom:16}}>⚖️ {t.logWeight}</div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <input type="number" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)} placeholder="68.5" style={{flex:1,background:S.surface,border:`1px solid ${S.border}`,borderRadius:10,padding:"11px",color:S.text,fontSize:20,fontFamily:"monospace",outline:"none",textAlign:"center"}}/>
            <span style={{color:S.textMuted,fontSize:14}}>{t.kg}</span>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={save} style={{flex:1,background:S.blue,color:S.bg,border:"none",borderRadius:10,padding:"11px 0",fontSize:13,fontWeight:700,cursor:"pointer"}}>{t.save}</button>
            <button onClick={()=>setOpen(null)} style={{padding:"11px 14px",background:S.surface,color:S.textMuted,border:`1px solid ${S.border}`,borderRadius:10,fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
          </div>
        </div>
      </div>}
      {open==="workout"&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:300}} onClick={()=>setOpen(null)}>
        <div style={{background:S.card,borderRadius:"22px 22px 0 0",width:"100%",maxWidth:560,padding:"18px 18px 36px",border:`1px solid ${S.border}`}} onClick={e=>e.stopPropagation()}>
          <div style={{width:36,height:4,background:"rgba(255,255,255,0.12)",borderRadius:2,margin:"0 auto 16px"}}/>
          <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:18,fontWeight:800,color:S.text,marginBottom:14}}>🏋️ {t.logWorkout}</div>
          <div style={{marginBottom:14}}><div style={{fontSize:10,color:S.textMuted,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>{t.workoutType}</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{WORKOUT_TYPES.map(tp=><button key={tp} onClick={()=>setW(p=>({...p,type:tp}))} style={{background:w.type===tp?S.accentDim:S.surface,border:w.type===tp?`1px solid ${S.accentBorder}`:`1px solid ${S.border}`,color:w.type===tp?S.accent:S.textMuted,borderRadius:20,padding:"6px 11px",fontSize:12,cursor:"pointer"}}>{tp}</button>)}</div></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <div><div style={{fontSize:10,color:S.textMuted,marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>{t.duration}</div><input type="number" value={w.duration||""} onChange={e=>setW(p=>({...p,duration:e.target.value}))} placeholder="45" style={{width:"100%",background:S.surface,border:`1px solid ${S.border}`,borderRadius:10,padding:"9px 12px",color:S.text,fontSize:14,fontFamily:"monospace",outline:"none"}}/></div>
            <div><div style={{fontSize:10,color:S.textMuted,marginBottom:5,textTransform:"uppercase",letterSpacing:1}}>{t.time}</div><input type="time" value={w.time||""} onChange={e=>setW(p=>({...p,time:e.target.value}))} style={{width:"100%",background:S.surface,border:`1px solid ${S.border}`,borderRadius:10,padding:"9px 12px",color:S.text,fontSize:14,outline:"none",colorScheme:"dark"}}/></div>
          </div>
          <div style={{marginBottom:16}}><div style={{fontSize:10,color:S.textMuted,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>{t.intensity}</div><div style={{display:"flex",gap:8}}>{[[t.easy,"Easy"],[t.moderate,"Moderate"],[t.hard,"Hard"]].map(([lbl,key])=><button key={key} onClick={()=>setW(p=>({...p,intensity:key}))} style={{flex:1,background:w.intensity===key?S.accentDim:S.surface,border:w.intensity===key?`1px solid ${S.accentBorder}`:`1px solid ${S.border}`,color:w.intensity===key?S.accent:S.textMuted,borderRadius:10,padding:"9px 0",fontSize:12,cursor:"pointer"}}>{lbl}</button>)}</div></div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={save} style={{flex:1,background:S.accent,color:S.bg,border:"none",borderRadius:11,padding:"12px 0",fontSize:13,fontWeight:700,cursor:"pointer"}}>{t.saveWorkout}</button>
            <button onClick={()=>setOpen(null)} style={{padding:"12px 14px",background:S.surface,color:S.textMuted,border:`1px solid ${S.border}`,borderRadius:11,fontSize:13,cursor:"pointer"}}>{t.cancel}</button>
          </div>
        </div>
      </div>}
    </div>
  );
}

/* ═══ MEAL GRID ══════════════════════════════════════════════════════════ */
function MealGrid({ meals, onUpdate, readOnly, isBackfill, S, t, lang }) {
  const [activeSlot,setActiveSlot]=useState(null);
  const slots=getMealSlots(lang);
  return (
    <>{<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      {slots.map(slot=>{ const e=meals?.[slot.id]; const done=e?.status==="done"; const fp=e?.photos?.[0]; const previewUrl=fp?.imageUrl||(fp?.base64?`data:${fp.mediaType||"image/jpeg"};base64,${fp.base64}`:null);
        return <div key={slot.id} onClick={()=>!readOnly&&setActiveSlot(slot)} style={{position:"relative",borderRadius:16,overflow:"hidden",cursor:readOnly?"default":"pointer",aspectRatio:"1.05",background:done?"rgba(255,255,255,0.05)":S.surface,border:done?`1px solid ${S.accentBorder}`:`1px dashed ${S.border}`,transition:"all 0.18s"}}
          onMouseOver={ev=>{if(!readOnly)ev.currentTarget.style.borderColor=done?S.accent:S.accentBorder;}} onMouseOut={ev=>ev.currentTarget.style.borderColor=done?S.accentBorder:S.border}>
          {previewUrl&&<img src={previewUrl} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.45}}/>}
          {done&&previewUrl&&<div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0) 50%)"}}/>}
          <div style={{position:"relative",zIndex:1,height:"100%",display:"flex",flexDirection:"column",justifyContent:"space-between",padding:11}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <span style={{fontSize:17}}>{slot.icon}</span>
              {done&&e.totals?.calories&&<div style={{background:"rgba(0,0,0,0.6)",borderRadius:20,padding:"2px 7px",fontSize:10,color:S.accent,fontFamily:"monospace",fontWeight:700}}>{e.totals.calories}</div>}
              {!done&&!readOnly&&<div style={{width:24,height:24,borderRadius:"50%",background:"rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:S.textMuted}}>+</div>}
            </div>
            <div>
              <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:13,fontWeight:700,color:done?S.text:"rgba(255,255,255,0.28)",marginBottom:2}}>{slot.label}</div>
              {done&&e.timestamp&&<div style={{fontSize:10,color:S.accent,fontFamily:"monospace"}}>{e.timestamp}</div>}
              {done&&e.totals?.calories>0&&<MacroBar totals={e.totals} compact S={S} t={t}/>}
              {done&&!e.totals?.calories&&e.foods?.length>0&&<div style={{fontSize:10,color:"rgba(255,255,255,0.45)",marginTop:2,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{e.foods.slice(0,3).join(", ")}</div>}
            </div>
          </div>
        </div>;
      })}
    </div>}
    {activeSlot&&<MealModal slot={activeSlot} entry={meals?.[activeSlot.id]} onSave={entry=>onUpdate(activeSlot.id,entry)} onClose={()=>setActiveSlot(null)} isBackfill={isBackfill} S={S} t={t}/>}
    </>
  );
}

/* ═══ CALENDAR ═══════════════════════════════════════════════════════════ */
function CalendarPicker({ history, onSelect, onClose, S, t, lang }) {
  const now=new Date(); const [vy,setVy]=useState(now.getFullYear()); const [vm,setVm]=useState(now.getMonth());
  const today=todayKey(); const calDays=getCalendarDays(vy,vm);
  const prev=()=>{if(vm===0){setVm(11);setVy(y=>y-1);}else setVm(m=>m-1);};
  const next=()=>{if(vm===11){setVm(0);setVy(y=>y+1);}else setVm(m=>m+1);};
  const dowLabels=lang==="es"?["Lu","Ma","Mi","Ju","Vi","Sá","Do"]:["Mo","Tu","We","Th","Fr","Sa","Su"];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:20}} onClick={onClose}>
      <div style={{background:S.card,borderRadius:20,width:"100%",maxWidth:360,padding:22,border:`1px solid ${S.border}`}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
          <button onClick={prev} style={{background:"none",border:"none",color:S.textMuted,cursor:"pointer",fontSize:20,padding:"0 8px"}}>‹</button>
          <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:15,fontWeight:700,color:S.text,textTransform:"capitalize"}}>{new Date(vy,vm).toLocaleDateString(lang==="es"?"es-AR":"en-US",{month:"long",year:"numeric"})}</div>
          <button onClick={next} style={{background:"none",border:"none",color:S.textMuted,cursor:"pointer",fontSize:20,padding:"0 8px"}}>›</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:8}}>{dowLabels.map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:S.textMuted,padding:"2px 0"}}>{d}</div>)}</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
          {calDays.map((d,i)=>{ if(!d)return<div key={i}/>; const isToday=d===today; const hasData=!!history[d]; const isFuture=d>today;
            return <button key={d} onClick={()=>!isFuture&&onSelect(d)} disabled={isFuture} style={{padding:"8px 0",background:isToday?S.accentDim:hasData?"rgba(255,255,255,0.05)":"transparent",border:isToday?`1px solid ${S.accentBorder}`:"1px solid transparent",borderRadius:8,color:isFuture?"rgba(255,255,255,0.12)":isToday?S.accent:hasData?"rgba(255,255,255,0.7)":"rgba(255,255,255,0.38)",cursor:isFuture?"default":"pointer",fontSize:13,position:"relative",transition:"all 0.15s"}} onMouseOver={e=>{if(!isFuture)e.currentTarget.style.background=S.accentDim;}} onMouseOut={e=>{if(!isFuture)e.currentTarget.style.background=isToday?S.accentDim:hasData?"rgba(255,255,255,0.05)":"transparent";}}>
              {d.slice(8)}{hasData&&!isToday&&<div style={{position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)",width:4,height:4,borderRadius:"50%",background:S.accent}}/>}
            </button>; })}
        </div>
        <div style={{marginTop:14,fontSize:11,color:S.textMuted,textAlign:"center"}}>{t.daysTap}</div>
      </div>
    </div>
  );
}

/* ═══ WEEK VIEW ══════════════════════════════════════════════════════════ */
function WeekView({ history, S, t, lang }) {
  const today=todayKey(); const week=getWeekDays(today);
  const wts=week.map(d=>history[d]?.weight?parseFloat(history[d].weight):null);
  const valid=wts.filter(v=>v!==null); const minW=valid.length?Math.min(...valid)-1:60; const maxW=valid.length?Math.max(...valid)+1:80;
  return (
    <div style={{animation:"fadeUp 0.35s ease"}}>
      <div style={{fontSize:10,color:S.textMuted,textTransform:"uppercase",letterSpacing:2,marginBottom:16}}>{t.thisWeek}</div>
      <div style={{marginBottom:26}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:5}}>
          {week.map(d=>{ const isToday=d===today; const day=history[d]; const count=Object.values(day?.meals||{}).filter(e=>e?.status==="done").length; const pct=count/6;
            return <div key={d} style={{textAlign:"center"}}><div style={{fontSize:9,color:isToday?S.accent:S.textMuted,marginBottom:5,textTransform:"uppercase",letterSpacing:0.5,fontWeight:isToday?700:400}}>{fmtDow(d,lang)}</div>
              <div style={{height:54,background:"rgba(255,255,255,0.035)",borderRadius:8,overflow:"hidden",position:"relative",border:isToday?`1px solid ${S.accentBorder}`:`1px solid ${S.border}`}}>
                <div style={{position:"absolute",bottom:0,left:0,right:0,height:`${pct*100}%`,background:`${S.accent}${Math.round((0.15+pct*0.55)*255).toString(16).padStart(2,"0")}`,transition:"height 0.5s",borderRadius:7}}/>
                <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:count>0?S.accent:"rgba(255,255,255,0.18)",fontFamily:"monospace"}}>{count||""}</div>
              </div>
              {day?.workout?.type&&<div style={{fontSize:10,color:S.orange,marginTop:3}}>{day.workout.type.match(/\p{Emoji}/gu)?.[0]||"🏋️"}</div>}
            </div>;
          })}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:S.textMuted}}><span>{t.mealsLogged}</span><span>{week.reduce((s,d)=>s+Object.values(history[d]?.meals||{}).filter(e=>e?.status==="done").length,0)} {t.of} {week.length*6}</span></div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:26}}>
        {[[t.workoutDays,`${week.filter(d=>history[d]?.workout?.type).length}`,t.days,S.orange],[t.mealsLogged,`${week.reduce((s,d)=>s+Object.values(history[d]?.meals||{}).filter(e=>e?.status==="done").length,0)}`,`${t.of} ${week.length*6}`,S.accent],[t.avgWeight,valid.length?(valid.reduce((a,b)=>a+b,0)/valid.length).toFixed(1):"—",t.kg,S.blue]].map(([lbl,val,sub,col])=>(
          <div key={lbl} style={{background:S.surface,border:`1px solid ${S.border}`,borderRadius:13,padding:"13px 10px",textAlign:"center"}}>
            <div style={{fontSize:21,fontWeight:700,color:col,fontFamily:"monospace",lineHeight:1}}>{val}</div>
            <div style={{fontSize:10,color:S.textMuted,marginTop:3}}>{sub}</div>
            <div style={{fontSize:9,color:S.textMuted,marginTop:2,textTransform:"uppercase",letterSpacing:0.5,opacity:0.7}}>{lbl}</div>
          </div>
        ))}
      </div>
      {valid.length>0?<div style={{background:S.surface,border:`1px solid ${S.border}`,borderRadius:13,padding:"14px 12px"}}>
        <div style={{fontSize:10,color:S.textMuted,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>{t.weightTrend}</div>
        <div style={{position:"relative",height:72}}>
          <svg width="100%" height="72" viewBox={`0 0 ${week.length*46} 72`} preserveAspectRatio="none">
            <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={S.blue} stopOpacity="0.22"/><stop offset="100%" stopColor={S.blue} stopOpacity="0"/></linearGradient></defs>
            {(()=>{ const pts=week.map((d,i)=>({x:i*46+23,y:history[d]?.weight?66-((parseFloat(history[d].weight)-minW)/(maxW-minW))*56:null})); const lp=pts.filter(p=>p.y!==null); if(lp.length<2)return null; const path=lp.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" "); return(<><path d={`${path} L${lp[lp.length-1].x},72 L${lp[0].x},72 Z`} fill="url(#wg)"/><path d={path} fill="none" stroke={S.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>{lp.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3.5" fill={S.blue}/>)}</>); })()}
          </svg>
          <div style={{display:"grid",gridTemplateColumns:`repeat(${week.length},1fr)`,position:"absolute",bottom:-18,left:0,right:0}}>
            {week.map(d=><div key={d} style={{textAlign:"center",fontSize:9,color:history[d]?.weight?S.blue:"rgba(255,255,255,0.15)"}}>{history[d]?.weight||"·"}</div>)}
          </div>
        </div>
        <div style={{height:18}}/>
      </div>:<div style={{background:S.surface,border:`1px dashed ${S.border}`,borderRadius:13,padding:"18px",textAlign:"center",color:S.textMuted,fontSize:13}}>{t.logWeightDaily}</div>}
    </div>
  );
}

/* ═══ HISTORY LIST ═══════════════════════════════════════════════════════ */
function HistoryList({ history, onSelect, S, t, lang }) {
  const entries=Object.entries(history).sort(([a],[b])=>b.localeCompare(a));
  if(!entries.length) return <div style={{textAlign:"center",color:S.textMuted,fontSize:14,padding:"48px 0"}}>{t.noHistory}</div>;
  return (
    <div style={{display:"grid",gap:8}}>
      {entries.map(([date,day])=>{
        const count=Object.values(day.meals||{}).filter(e=>e?.status==="done").length;
        const dayKcal=Object.values(day.meals||{}).reduce((s,e)=>s+(e?.totals?.calories||0),0);
        const slots=getMealSlots(lang);
        const desc=slots.map(s=>day.meals?.[s.id]?.photos?.[0]?.description).filter(Boolean)[0]||slots.map(s=>day.meals?.[s.id]?.foods?.[0]).filter(Boolean).slice(0,2).join(", ");
        return <button key={date} onClick={()=>onSelect(date)} style={{background:S.surface,border:`1px solid ${S.border}`,borderRadius:13,padding:"12px 14px",cursor:"pointer",textAlign:"left",color:S.text,display:"flex",alignItems:"center",gap:12,width:"100%",transition:"background 0.15s"}} onMouseOver={e=>e.currentTarget.style.background=S.accentDim} onMouseOut={e=>e.currentTarget.style.background=S.surface}>
          <div style={{textAlign:"center",minWidth:32}}>
            <div style={{fontSize:15,fontWeight:700,color:S.accent,fontFamily:"monospace",lineHeight:1}}>{date.slice(8)}</div>
            <div style={{fontSize:9,color:S.textMuted,textTransform:"uppercase",letterSpacing:1,marginTop:2}}>{new Date(...date.split("-").map((v,i)=>i===1?+v-1:+v)).toLocaleString(lang==="es"?"es-AR":"en-US",{month:"short"})}</div>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:2,textTransform:"capitalize"}}>{fmtMed(date,lang)}</div>
            <div style={{fontSize:11,color:S.textMuted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{desc||t.noFoods}</div>
            <div style={{display:"flex",gap:7,marginTop:3}}>
              {dayKcal>0&&<span style={{fontSize:10,color:S.accent,fontFamily:"monospace",fontWeight:600}}>{dayKcal} kcal</span>}
              {day.workout?.type&&<span style={{fontSize:10,color:S.orange}}>🏋️ {day.workout.type}</span>}
              {day.weight&&<span style={{fontSize:10,color:S.blue}}>⚖️ {day.weight}{t.kg}</span>}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
            <div style={{fontSize:11,color:count>=4?S.accent:S.textMuted,fontWeight:600}}>{count}/6</div>
            <div style={{display:"flex",gap:2}}>{getMealSlots(lang).map(s=><div key={s.id} style={{width:5,height:5,borderRadius:"50%",background:day.meals?.[s.id]?.status==="done"?S.accent:"rgba(255,255,255,0.09)"}}/>)}</div>
          </div>
        </button>;
      })}
    </div>
  );
}

/* ═══ PDF ════════════════════════════════════════════════════════════════ */
function buildPDF(history, userName, lang) {
  const t=T[lang]; const slots=getMealSlots(lang);
  const entries=Object.entries(history).sort(([a],[b])=>a.localeCompare(b));
  const mBar=(tot)=>{ if(!tot)return""; const tt=tot.protein+tot.carbs+tot.fat; if(!tt)return""; const p=Math.round(tot.protein/tt*100),c=Math.round(tot.carbs/tt*100),f=Math.round(tot.fat/tt*100); return `<div style="margin-top:4px"><div style="display:flex;height:5px;border-radius:3px;overflow:hidden;gap:1px;width:130px"><div style="width:${p}%;background:#f4845f"></div><div style="width:${c}%;background:#f6c954"></div><div style="width:${f}%;background:#4db849"></div></div><div style="font-size:9px;color:#888;margin-top:2px"><span style="color:#f4845f">${tot.protein}g P</span> · <span style="color:#a07800">${tot.carbs}g C</span> · <span style="color:#2d7a3a">${tot.fat}g F</span>${tot.fibre?` · <span style="color:#1a4488">${tot.fibre}g Fi</span>`:""}</div></div>`; };
  const dayBlocks=entries.map(([date,day])=>{
    const dTot={calories:0,protein:0,carbs:0,fat:0,fibre:0};
    const rows=slots.map(s=>{ const e=day.meals?.[s.id]; if(!e||e.status!=="done")return`<tr class="er"><td>${s.icon} ${s.label}</td><td class="mu">—</td><td class="mu">—</td><td></td></tr>`; const tot=e.totals||{}; if(tot.calories){dTot.calories+=tot.calories||0;dTot.protein+=tot.protein||0;dTot.carbs+=tot.carbs||0;dTot.fat+=tot.fat||0;dTot.fibre+=tot.fibre||0;} const iR=(e.ingredients||[]).map(i=>`<div style="display:flex;justify-content:space-between;font-size:10px;color:#555;margin-top:2px;border-bottom:1px dotted #eee;padding:1px 0"><span>${i.name}</span><span style="font-family:monospace;color:#888">${i.calories}kcal <span style="color:#f4845f">${i.protein}P</span> <span style="color:#a07800">${i.carbs}C</span> <span style="color:#2d7a3a">${i.fat}F</span></span></div>`).join(""); const photos=(e.photos||[]).slice(0,3).filter(p=>p.base64).map(p=>`<img src="data:image/jpeg;base64,${p.base64}" style="width:80px;height:60px;object-fit:cover;border-radius:6px;margin:2px;border:1px solid #eee;display:inline-block;vertical-align:top"/>`).join(""); return `<tr><td class="bo">${s.icon} ${s.label}<br><span style="font-size:10px;color:#2d7a3a;font-family:monospace">${e.timestamp||""}</span></td><td>${e.photos?.[0]?.description?`<div style="font-size:11px;color:#555;font-style:italic;margin-bottom:4px">${e.photos[0].description}</div>`:""}${iR}${e.notes?`<div style="font-size:10px;color:#999;margin-top:4px">"${e.notes}"</div>`:""}</td><td>${tot.calories?`<div style="font-size:13px;font-weight:700;color:#1a3a2a;font-family:monospace">${tot.calories} kcal</div>${mBar(tot)}`:"—"}</td><td>${photos}</td></tr>`; }).join("");
    const w=day.workout; const wt=day.weight;
    const wRow=w?.type?`<tr style="background:#fffbf0"><td colspan="4" style="font-size:11px;padding:5px 10px;color:#774400">🏋️ <b>${w.type}</b>${w.duration?` · ${w.duration}min`:""}${w.time?` · ${w.time}`:""}${w.intensity?` · ${w.intensity}`:""}</td></tr>`:"";
    const wtRow=wt?`<tr style="background:#f0f5ff"><td colspan="4" style="font-size:11px;padding:5px 10px;color:#224488">⚖️ ${t.weight}: <b>${wt} ${t.kg}</b></td></tr>`:"";
    const totRow=dTot.calories?`<tr style="background:#edf7ea;border-top:2px solid #c8e6c0"><td colspan="2" style="text-align:right;font-weight:700;font-size:11px;color:#1a3a2a;padding:6px 10px">${t.dailyTotal}</td><td style="padding:6px 10px"><div style="font-size:14px;font-weight:700;color:#1a3a2a;font-family:monospace">${dTot.calories} kcal</div>${mBar(dTot)}</td><td></td></tr>`:"";
    return `<div style="margin-bottom:32px;page-break-inside:avoid"><h3 style="font-size:15px;color:#1a3a2a;border-bottom:2px solid #c8e6c0;padding-bottom:6px;margin-bottom:8px;text-transform:capitalize">${fmtFull(date,lang)}</h3><table style="width:100%;border-collapse:collapse;font-size:12px;font-family:Helvetica,Arial,sans-serif"><thead><tr style="background:#edf7ea"><th style="padding:6px 10px;text-align:left;color:#1a3a2a;font-size:10px;text-transform:uppercase;letter-spacing:.8px;width:110px">${lang==="es"?"Comida":"Meal"}</th><th style="padding:6px 10px;text-align:left;color:#1a3a2a;font-size:10px;text-transform:uppercase;letter-spacing:.8px">${lang==="es"?"Ingredientes":"Ingredients"}</th><th style="padding:6px 10px;text-align:left;color:#1a3a2a;font-size:10px;text-transform:uppercase;letter-spacing:.8px;width:155px">Macros</th><th style="padding:6px 10px;text-align:left;color:#1a3a2a;font-size:10px;text-transform:uppercase;letter-spacing:.8px;width:175px">${lang==="es"?"Fotos":"Photos"}</th></tr></thead><tbody>${rows}${wRow}${wtRow}${totRow}</tbody></table></div>`;
  }).join("");
  const tot=entries.length; const meals=entries.reduce((s,[,d])=>s+Object.values(d.meals||{}).filter(e=>e?.status==="done").length,0); const wDays=entries.filter(([,d])=>d.workout?.type).length;
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Tracky. — ${userName}</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Georgia,serif;color:#111;padding:44px 48px;max-width:920px;margin:0 auto;font-size:13px;line-height:1.5}h1{font-family:'Plus Jakarta Sans',Helvetica,sans-serif;font-size:30px;font-weight:900;letter-spacing:-1.5px;color:#1a3a2a;margin-bottom:3px}h1 span{color:#2d7a3a}.sub{color:#777;font-size:12px;margin-bottom:12px;font-family:Helvetica,sans-serif}.stats{display:flex;gap:16px;margin-bottom:16px}.sb{background:#edf7ea;border:1px solid #c8e6c0;border-radius:8px;padding:10px 16px;text-align:center}.sb .n{font-size:22px;font-weight:bold;color:#1a3a2a;font-family:'Courier New',monospace}.sb .l{font-size:10px;color:#666;font-family:Helvetica,sans-serif;text-transform:uppercase;letter-spacing:.5px;margin-top:2px}hr{border:none;border-top:2px solid #c8e6c0;margin-bottom:28px}button.pb{background:#1a3a2a;color:white;border:none;padding:9px 22px;border-radius:6px;cursor:pointer;font-size:13px;margin-bottom:28px;font-family:Helvetica,sans-serif}td{padding:8px 10px;vertical-align:top;border-bottom:1px solid #f0f0f0}tr:last-child td{border-bottom:none}tr:nth-child(even) td{background:#fafff9}.er td{color:#bbb}.bo{font-weight:600;color:#222}.mu{color:#bbb}@media print{.pb{display:none}}</style></head><body><h1>Tracky<span>.</span></h1><p class="sub">${userName} · ${new Date().toLocaleDateString(lang==="es"?"es-AR":"en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</p><div class="stats"><div class="sb"><div class="n">${tot}</div><div class="l">${t.days}</div></div><div class="sb"><div class="n">${meals}</div><div class="l">${t.mealsLogged}</div></div><div class="sb"><div class="n">${wDays}</div><div class="l">${t.workoutDays}</div></div></div><button class="pb" onclick="window.print()">🖨 ${t.printPdf}</button><hr/>${dayBlocks||`<p style="color:#aaa">${t.noHistory}</p>`}</body></html>`;
  const win=window.open("","_blank"); if(win){win.document.write(html);win.document.close();}
}

/* ═══ MAIN APP ═══════════════════════════════════════════════════════════ */
function App({ user, onLogout }) {
  const [tab,setTab]=useState("today");
  const [lang,setLang]=useState(user.lang||"en");
  const [skinId,setSkinId]=useState(user.skin||"green");
  const [todayData,setTodayData]=useState({meals:{},workout:{},weight:""});
  const [history,setHistory]=useState({});
  const [historyDay,setHistoryDay]=useState(null);
  const [showCal,setShowCal]=useState(false);
  const [showSettings,setShowSettings]=useState(false);
  const [toast,setToast]=useState(null);
  const today=todayKey();
  const S=SKINS[skinId]; const t=T[lang];

  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(null),2600);};
  useEffect(()=>{(async()=>{ const data=loadUserData(user.id); setHistory(data); if(data[today])setTodayData(data[today]); })();},[user.id]);
  const persist=useCallback(async(date,nd)=>{ const nh={...history,[date]:nd}; setHistory(nh); saveUserData(user.id,nh); },[history,user.id]);
  const updateMeal=(date,slotId,entry)=>{ const isT=date===today; const base=isT?todayData:(history[date]||{meals:{},workout:{},weight:""}); const nd={...base,meals:{...base.meals,[slotId]:entry}}; if(!entry)delete nd.meals[slotId]; if(isT)setTodayData(nd); persist(date,nd); };
  const updateStats=(date,stats)=>{ const isT=date===today; const base=isT?todayData:(history[date]||{meals:{},workout:{},weight:""}); const nd={...base,...stats}; if(isT)setTodayData(nd); persist(date,nd); };
  const handleSaveSettings=async(newLang,newSkin)=>{ setLang(newLang); setSkinId(newSkin); setShowSettings(false); const users=loadUsers(); saveUsers(users.map(u=>u.id===user.id?{...u,lang:newLang,skin:newSkin}:u)); showToast(T[newLang].settingsSaved); };
  const handleCalSelect=d=>{setShowCal(false);if(d===today)setTab("today");else{setTab("history");setHistoryDay(d);};};
  const dayKcal=Object.values(todayData.meals||{}).reduce((s,e)=>s+(e?.totals?.calories||0),0);
  const loggedCount=Object.values(todayData.meals||{}).filter(e=>e?.status==="done").length;
  const viewedDay=historyDay?{...(history[historyDay]||{meals:{},workout:{},weight:""})}:null;

  return (
    <div style={{minHeight:"100vh",background:S.bg,fontFamily:"'DM Sans',sans-serif",color:S.text,paddingBottom:60,transition:"background 0.4s"}}>
      {toast&&<div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:S.card,border:`1px solid ${S.accentBorder}`,color:S.accent,padding:"10px 22px",borderRadius:30,fontSize:13,zIndex:999,animation:"toastIn 0.3s ease",whiteSpace:"nowrap",boxShadow:"0 6px 24px rgba(0,0,0,0.5)"}}>{toast}</div>}
      {showCal&&<CalendarPicker history={history} onSelect={handleCalSelect} onClose={()=>setShowCal(false)} S={S} t={t} lang={lang}/>}
      {showSettings&&<SettingsModal user={user} S={S} lang={lang} skinId={skinId} onSave={handleSaveSettings} onClose={()=>setShowSettings(false)}/>}

      {/* Header */}
      <div style={{padding:"24px 18px 0",borderBottom:`1px solid ${S.border}`}}>
        <div style={{maxWidth:560,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <Wordmark S={S} size={28}/>
              <div style={{display:"flex",gap:10,alignItems:"center",marginTop:3}}>
                <div style={{fontSize:11,color:S.textMuted}}>{user.name}</div>
                {tab==="today"&&dayKcal>0&&<div style={{fontSize:11,color:S.accent,fontFamily:"monospace",fontWeight:600}}>{dayKcal} kcal</div>}
              </div>
            </div>
            <div style={{display:"flex",gap:6,alignItems:"center"}}>
              <button onClick={()=>setShowCal(true)} style={{background:S.surface,border:`1px solid ${S.border}`,color:S.textMuted,borderRadius:9,padding:"5px 9px",fontSize:13,cursor:"pointer"}}>📅</button>
              <button onClick={()=>buildPDF({...history,[today]:todayData},user.name,lang)} style={{background:S.accentDim,border:`1px solid ${S.accentBorder}`,color:S.accent,borderRadius:9,padding:"5px 11px",fontSize:12,cursor:"pointer",fontWeight:600}}>{t.pdfExport}</button>
              <button onClick={()=>setShowSettings(true)} style={{background:S.surface,border:`1px solid ${S.border}`,color:S.textMuted,borderRadius:9,padding:"5px 9px",fontSize:13,cursor:"pointer"}}>⚙️</button>
              <button onClick={onLogout} style={{background:S.surface,border:`1px solid ${S.border}`,color:S.textMuted,borderRadius:9,padding:"5px 9px",fontSize:12,cursor:"pointer"}}>↩</button>
            </div>
          </div>
          <div style={{display:"flex",gap:3,background:"rgba(255,255,255,0.03)",borderRadius:10,padding:3}}>
            {[["today",t.today],["week",t.week],["history",t.history]].map(([key,label])=>(
              <button key={key} onClick={()=>{setTab(key);setHistoryDay(null);}} style={{flex:1,padding:"8px 0",fontSize:13,fontWeight:500,borderRadius:8,border:"none",cursor:"pointer",background:tab===key?S.accentDim:"transparent",color:tab===key?S.accent:S.textMuted,transition:"all 0.2s"}}>{label}</button>
            ))}
          </div>
          {tab==="today"&&<div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0 0"}}>
            <div style={{flex:1,height:2,background:"rgba(255,255,255,0.06)",borderRadius:1}}><div style={{height:"100%",background:`linear-gradient(90deg,${S.accent},${S.accent}aa)`,borderRadius:1,width:`${(loggedCount/6)*100}%`,transition:"width 0.5s"}}/></div>
            <div style={{fontSize:11,color:S.textMuted,whiteSpace:"nowrap"}}>{loggedCount} {t.of} 6</div>
          </div>}
        </div>
      </div>

      {/* Body */}
      <div style={{maxWidth:560,margin:"0 auto",padding:"16px 18px",animation:"fadeUp 0.35s ease"}}>
        {tab==="today"&&<><DailyStats stats={{workout:todayData.workout,weight:todayData.weight}} onChange={s=>updateStats(today,s)} readOnly={false} S={S} t={t}/><MealGrid meals={todayData.meals} onUpdate={(id,e)=>updateMeal(today,id,e)} readOnly={false} isBackfill={false} S={S} t={t} lang={lang}/></>}
        {tab==="week"&&<WeekView history={history} S={S} t={t} lang={lang}/>}
        {tab==="history"&&!historyDay&&<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:11,color:S.textMuted}}>{t.allLoggedDays}</div>
            <button onClick={()=>setShowCal(true)} style={{background:S.accentDim,border:`1px solid ${S.accentBorder}`,color:S.accent,borderRadius:20,padding:"5px 12px",fontSize:11,cursor:"pointer",fontWeight:600}}>+ {t.addPastEntry}</button>
          </div>
          <HistoryList history={history} onSelect={d=>setHistoryDay(d)} S={S} t={t} lang={lang}/>
        </>}
        {tab==="history"&&historyDay&&<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <button onClick={()=>setHistoryDay(null)} style={{background:"none",border:"none",color:S.accent,cursor:"pointer",fontSize:13,padding:0}}>← {t.back}</button>
            <button onClick={()=>buildPDF({[historyDay]:history[historyDay]||{}},user.name,lang)} style={{background:S.accentDim,border:`1px solid ${S.accentBorder}`,color:S.accent,borderRadius:9,padding:"5px 12px",fontSize:12,cursor:"pointer",fontWeight:600}}>{t.pdfExport}</button>
          </div>
          <h2 style={{fontFamily:"'Plus Jakarta Sans',sans-serif",fontSize:17,fontWeight:800,color:S.text,margin:"0 0 14px",textTransform:"capitalize"}}>{fmtFull(historyDay,lang)}</h2>
          {historyDay<today&&<div style={{fontSize:11,color:S.orange,background:"rgba(255,180,80,0.08)",border:"1px solid rgba(255,180,80,0.18)",borderRadius:8,padding:"6px 12px",marginBottom:14}}>✏️ {t.editPastEntry}</div>}
          <DailyStats stats={{workout:viewedDay?.workout,weight:viewedDay?.weight}} onChange={s=>updateStats(historyDay,s)} readOnly={historyDay>today} S={S} t={t}/>
          <MealGrid meals={viewedDay?.meals} onUpdate={(id,e)=>updateMeal(historyDay,id,e)} readOnly={historyDay>today} isBackfill={historyDay<today} S={S} t={t} lang={lang}/>
        </div>}
      </div>
    </div>
  );
}

/* ═══ ROOT ═══════════════════════════════════════════════════════════════ */
export default function Root() {
  const [user,setUser]=useState(null);
  if(!user) return <AuthScreen onLogin={setUser}/>;
  return <App user={user} onLogout={()=>setUser(null)}/>;
}
