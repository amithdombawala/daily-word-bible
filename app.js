import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCsC5eU1ZjxObi6ARA49BoFLmV8U8vDm9I",
  authDomain: "daily-word-7a44a.firebaseapp.com",
  projectId: "daily-word-7a44a",
  storageBucket: "daily-word-7a44a.firebasestorage.app",
  messagingSenderId: "747206481642",
  appId: "1:747206481642:web:3d4cce30c1b58e0c8e6993"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

const ADMIN_EMAILS = ["admin@dailyword.app"];
const CUSTOM_VERSES_CACHE_KEY = "dailyword-custom-verses-cache";

let shineAnimationReady = false;

function ensureThemeAndButtonShineKeyframes() {
  if (shineAnimationReady) return;
  shineAnimationReady = true;

  const styleEl = document.createElement("style");
  styleEl.textContent = `
    @keyframes dailywordBtnGloss {
      0% { transform: translateX(-145%) skewX(-24deg); opacity: 0; }
      22% { opacity: 0.72; }
      55% { opacity: 0.85; }
      100% { transform: translateX(265%) skewX(-24deg); opacity: 0; }
    }
    @keyframes dailywordCardGloss {
      0% { transform: translateX(-120%) skewX(-20deg); opacity: 0; }
      25% { opacity: 0.35; }
      55% { opacity: 0.42; }
      100% { transform: translateX(240%) skewX(-20deg); opacity: 0; }
    }
  `;
  document.head.appendChild(styleEl);
}

function applyThemeCardShine() {
  ensureThemeAndButtonShineKeyframes();

  document.querySelectorAll(".dw-theme-card").forEach(card => {
    card.style.position = "relative";
    card.style.overflow = "hidden";
    card.style.boxShadow = "0 10px 26px rgba(25, 56, 42, 0.08), inset 0 1px 0 rgba(245, 242, 235, 0.9)";

    if (!card.querySelector(".dw-card-shine")) {
      const sheen = document.createElement("span");
      sheen.className = "dw-card-shine";
      sheen.style.position = "absolute";
      sheen.style.top = "-30%";
      sheen.style.left = "0";
      sheen.style.width = "38%";
      sheen.style.height = "160%";
      sheen.style.pointerEvents = "none";
      sheen.style.background =
        "linear-gradient(90deg, transparent, rgba(245, 242, 235, 0.65), rgba(148, 113, 60, 0.14), transparent)";
      sheen.style.animation = "dailywordCardGloss 5.2s ease-in-out infinite";
      card.appendChild(sheen);
    }
  });
}

// variant: 'forest' (#19382a) | 'ivory' (#f5f2eb / #efe9dc)
function apply3DButtonStyle(btn, variant = "forest") {
  if (!btn) return;
  ensureThemeAndButtonShineKeyframes();

  const isForest = variant === "forest";

  btn.style.position = "relative";
  btn.style.overflow = "hidden";
  btn.style.fontFamily = "inherit";
  btn.style.fontWeight = "700";
  btn.style.borderRadius = "15px";
  btn.style.padding = "13px 18px";
  btn.style.cursor = "pointer";
  btn.style.transition = "transform 0.12s ease, box-shadow 0.12s ease";

  const restShadow = isForest
    ? "inset 0 2px 1px rgba(245, 242, 235, 0.26), inset 0 -3px 6px rgba(10, 24, 18, 0.42), 0 7px 0 #0c1d15, 0 14px 24px rgba(25, 56, 42, 0.28)"
    : "inset 0 2px 1px rgba(255, 255, 255, 0.95), inset 0 -3px 5px rgba(25, 56, 42, 0.14), 0 7px 0 #19382a, 0 14px 22px rgba(25, 56, 42, 0.16)";

  const pressShadow = isForest
    ? "inset 0 3px 7px rgba(0, 0, 0, 0.48), 0 2px 0 #0c1d15, 0 5px 10px rgba(25, 56, 42, 0.18)"
    : "inset 0 3px 7px rgba(25, 56, 42, 0.25), 0 2px 0 #19382a, 0 5px 10px rgba(25, 56, 42, 0.12)";

  if (isForest) {
    btn.style.background = "linear-gradient(180deg, #275641 0%, #19382a 62%, #11271d 100%)";
    btn.style.color = "#f5f2eb";
    btn.style.border = "1px solid #10241b";
  } else {
    btn.style.background = "linear-gradient(180deg, #faf8f2 0%, #efe9dc 60%, #e3dac8 100%)";
    btn.style.color = "#19382a";
    btn.style.border = "1px solid #19382a";
  }

  btn.style.boxShadow = restShadow;

  if (!btn.querySelector(".dw-3d-shine")) {
    const shine = document.createElement("span");
    shine.className = "dw-3d-shine";
    shine.style.position = "absolute";
    shine.style.top = "-20%";
    shine.style.left = "0";
    shine.style.width = "48%";
    shine.style.height = "140%";
    shine.style.pointerEvents = "none";
    shine.style.background = isForest
      ? "linear-gradient(90deg, transparent, rgba(245, 242, 235, 0.34), transparent)"
      : "linear-gradient(90deg, transparent, rgba(25, 56, 42, 0.14), rgba(255, 255, 255, 0.7), transparent)";
    shine.style.animation = "dailywordBtnGloss 2.8s ease-in-out infinite";
    btn.appendChild(shine);
  }

  btn.addEventListener("pointerdown", () => {
    btn.style.transform = "translateY(5px)";
    btn.style.boxShadow = pressShadow;
  });

  const release = () => {
    btn.style.transform = "translateY(0)";
    btn.style.boxShadow = restShadow;
  };

  btn.addEventListener("pointerup", release);
  btn.addEventListener("pointerleave", release);
}

function decorateStaticButtons() {
  document.querySelectorAll("button").forEach(btn => {
    if (!btn.classList.contains("nov-verse-button")) {
      apply3DButtonStyle(btn, "forest");
    }
  });
}

const verses = [
  {ref:'Philippians 4:13', si:'මා ශක්තිමත් කරන ක්‍රිස්තුස්වහන්සේ තුළින් මට සියල්ල කළ හැකිය.', en:'I can do all things through Christ which strengtheneth me.', meaningSi:'අපගේ ශක්තිය අප තුළින් පමණක් නොව ක්‍රිස්තුස්වහන්සේ තුළින් ලැබේ. අභියෝග හමුවේ තනිවම නොසිට උන්වහන්සේගේ උපකාරය විශ්වාස කරන්න.', meaningEn:'Our strength does not come only from ourselves. Through Christ, we can face challenges with courage and trust rather than feeling alone.', related:[['Isaiah 40:31','දෙවියන්වහන්සේ කෙරෙහි බලා සිටින අයට අලුත් ශක්තිය ලැබේ.'],['2 Corinthians 12:9','දුර්වලකම තුළ දෙවියන්වහන්සේගේ කරුණාව ප්‍රමාණවත්ය.'],['Psalm 28:7','ස්වාමීන්වහන්සේ අපගේ ශක්තිය සහ පලිහය.'],['Ephesians 6:10','ස්වාමීන්වහන්සේ තුළ ශක්තිමත් වන්න.']]},
  {ref:'Proverbs 3:5', si:'ඔබගේ මුළු හදවතින්ම ස්වාමීන්වහන්සේ කෙරෙහි විශ්වාස කරන්න; ඔබගේම අවබෝධය මත පමණක් රඳා නොසිටින්න.', en:'Trust in the LORD with all thine heart; and lean not unto thine own understanding.', meaningSi:'සෑම දෙයක්ම අපට පැහැදිලි නොවන අවස්ථාවලදීත් දෙවියන්වහන්සේ කෙරෙහි විශ්වාසය තබන්න. අපගේ සීමිත දැනුමට වඩා උන්වහන්සේගේ මඟපෙන්වීම විශ්වාස කළ හැකිය.', meaningEn:'When life is unclear, trust God beyond what you can understand. His wisdom is greater than our limited perspective.', related:[['Proverbs 3:6','ඔබගේ සියලු මාර්ගවල උන්වහන්සේ පිළිගන්න; උන්වහන්සේ ඔබගේ මාර්ග සෘජු කරනු ඇත.'],['Psalm 37:5','ඔබගේ මාර්ගය ස්වාමීන්වහන්සේට භාර දෙන්න.'],['Isaiah 26:3','දෙවියන්වහන්සේ කෙරෙහි විශ්වාස කරන අයට සාමය ලැබේ.'],['Jeremiah 17:7','ස්වාමීන්වහන්සේ කෙරෙහි විශ්වාස කරන තැනැත්තා ආශීර්වාද ලබයි.']]},
  {ref:'Matthew 11:28', si:'වෙහෙසට පත්ව බර උසුලන සියල්ලෙනි, මා වෙත එන්න; මම ඔබට විවේකය දෙන්නෙමි.', en:'Come unto me, all ye that labour and are heavy laden, and I will give you rest.', meaningSi:'ඔබගේ සිතේ බර, වෙහෙස සහ කනස්සල්ල තනිවම දරාගැනීමට අවශ්‍ය නැත. යේසුස්වහන්සේ වෙත පැමිණ ඒවා උන්වහන්සේට භාර දෙන්න.', meaningEn:'You do not have to carry every burden alone. Jesus invites you to come to Him and find rest for your heart and soul.', related:[['Psalm 55:22','ඔබගේ බර ස්වාමීන්වහන්සේ මත තබන්න.'],['John 14:27','යේසුස්වහන්සේ තම සාමය අපට දෙන සේක.'],['1 Peter 5:7','ඔබගේ සියලු කනස්සල්ල උන්වහන්සේ මත තබන්න.'],['Psalm 23:1-3','ස්වාමීන්වහන්සේ මඟ පෙන්වා ආත්මය ප්‍රබෝධමත් කරන සේක.']]},
  {ref:'Psalm 23:1', si:'ස්වාමීන්වහන්සේ මාගේ එඬේරාය; මට කිසි අඩුවක් නොවන්නේය.', en:'The LORD is my shepherd; I shall not want.', meaningSi:'එඬේරෙකු තම බැටළුවන් රැකබලා ගන්නා සේ දෙවියන්වහන්සේ අප ගැන සැලකිලිමත් වන සේක. අපට අවශ්‍ය මඟපෙන්වීම, ආරක්ෂාව සහ රැකවරණය උන්වහන්සේගෙන් ලැබේ.', meaningEn:'Like a shepherd caring for sheep, God watches over us. We can trust His guidance, care, and provision.', related:[['John 10:11','යේසුස්වහන්සේ යහපත් එඬේරාය.'],['Psalm 34:10','ස්වාමීන්වහන්සේ සොයන අයට යහපත් දේවලින් අඩුවක් නොවේ.'],['Matthew 6:31-33','දෙවියන්වහන්සේ අපගේ අවශ්‍යතා දන්නා සේක.'],['Isaiah 40:11','උන්වහන්සේ තම රැළ මෘදු ලෙස රැකබලා ගන්නා සේක.']]},
  {ref:'Romans 8:28', si:'දෙවියන්වහන්සේට ප්‍රේම කරන අයට, උන්වහන්සේගේ අරමුණ අනුව කැඳවනු ලැබූ අයට, සියල්ල යහපත සඳහා ක්‍රියා කරන බව අපි දනිමු.', en:'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.', meaningSi:'සෑම සිදුවීමක්ම අපට හොඳ ලෙස පෙනෙන්නේ නැත. නමුත් අසීරු කාලයන් තුළ පවා දෙවියන්වහන්සේ යහපත් අරමුණක් ඉටු කිරීමට ක්‍රියා කරන බව විශ්වාස කිරීමට මෙම පදය අපට මතක් කර දෙයි.', meaningEn:'Not every circumstance feels good, but this verse reminds us that God can work through even difficult seasons toward His good purpose.', related:[['Genesis 50:20','අයහපත සඳහා අදහස් කළ දෙයක් දෙවියන්වහන්සේ යහපත සඳහා හැරවූ සේක.'],['Jeremiah 29:11','දෙවියන්වහන්සේගේ අරමුණු බලාපොරොත්තුව සහ අනාගතය ලබා දෙයි.'],['James 1:2-4','පරීක්ෂාවන් තුළින් ඉවසීම වර්ධනය වේ.'],['Psalm 121:2','අපගේ උපකාරය අහසත් පොළොවත් මැවූ ස්වාමීන්වහන්සේගෙන්ය.']]},
  {ref:'Joshua 1:9', si:'ධෛර්යවත් වී ශක්තිමත්ව සිටින්න. බිය නොවන්න; කලබල නොවන්න; ඔබ යන සෑම තැනකම ඔබගේ දෙවිවූ ස්වාමීන්වහන්සේ ඔබ සමඟ සිටින සේක.', en:'Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.', meaningSi:'අලුත් ආරම්භයන් සහ නොදන්නා අනාගතය බිය උපදවන්න පුළුවන්. නමුත් දෙවියන්වහන්සේ ඔබ සමඟ සිටින බව මතක තබාගෙන ධෛර්යයෙන් ඉදිරියට යන්න.', meaningEn:'New beginnings and uncertainty can be frightening. Remember that God is with you, and take your next step with courage.', related:[['Deuteronomy 31:6','ධෛර්යවත් වන්න; දෙවියන්වහන්සේ ඔබ අත් නොහරින සේක.'],['Psalm 27:1','ස්වාමීන්වහන්සේ අපගේ ආලෝකය සහ ගැළවීමය; අප බිය විය යුත්තේ කාටද?'],['Isaiah 41:10','බිය නොවන්න; දෙවියන්වහන්සේ ඔබ සමඟ සිටින සේක.'],['2 Timothy 1:7','දෙවියන්වහන්සේ බිය නොව ශක්තිය, ප්‍රේමය සහ සංයමය දෙන සේක.']]},
  {ref:'1 Corinthians 13:4', si:'ප්‍රේමය ඉවසිලිවන්තය; ප්‍රේමය කරුණාවන්තය. එය ඊර්ෂ්‍යා නොකරයි; පුරසාරම් දොඩන්නේ නැත; අහංකාර නොවේ.', en:'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up.', meaningSi:'සැබෑ ප්‍රේමය වචනවලට පමණක් සීමා නොවේ. එය ඉවසීම, කරුණාව, අන් අයට ගෞරවය සහ නිහතමානීකම තුළින් පෙන්වයි. අද ඔබගේ ක්‍රියාවකින් කෙනෙකුට ප්‍රේමය පෙන්වන්න.', meaningEn:'True love is more than words. It is shown through patience, kindness, respect, and humility. Choose one action today to show love to someone.', related:[['John 13:34','එකිනෙකාට ප්‍රේම කරන්න යන නව ආඥාව.'],['1 John 4:7','එකිනෙකාට ප්‍රේම කරමු; ප්‍රේමය දෙවියන්වහන්සේගෙන්ය.'],['Colossians 3:14','සියල්ලට ඉහළින් ප්‍රේමය පැළඳගන්න.'],['Romans 12:10','සහෝදර ප්‍රේමයෙන් එකිනෙකාට ආදරය කරන්න.']]},
  {ref:'Psalm 46:1',si:'දෙවියන්වහන්සේ අපගේ රැකවරණයත් ශක්තියත්ය; විපතේදී ඉතා ළඟ සිටින උපකාරයය.',en:'God is our refuge and strength, a very present help in trouble.',meaningSi:'අසීරු අවස්ථාවලදී දෙවියන්වහන්සේ අපට ආරක්ෂාවත් ශක්තියත් ලබා දෙන බව මතක් කරගන්න. උන්වහන්සේ වෙත යාමට ඔබට හැමවිටම හැකිය.',meaningEn:'In difficult moments, remember that God is our refuge and strength. You can always turn to Him for help.',related:[['Psalm 91:2','දෙවියන්වහන්සේ අපගේ රැකවරණය හා බලකොටුවය.'],['Isaiah 41:10','බිය නොවන්න; දෙවියන්වහන්සේ ඔබ සමඟ සිටින සේක.'],['Nahum 1:7','ස්වාමීන්වහන්සේ විපත් දවසේ බලකොටුවය.']]},
  {ref:'Psalm 34:8',si:'ස්වාමීන්වහන්සේ යහපත් බව රසවිඳ බලා දැනගන්න; උන්වහන්සේ කෙරෙහි විශ්වාස කරන තැනැත්තා ආශීර්වාද ලබයි.',en:'O taste and see that the LORD is good: blessed is the man that trusteth in him.',meaningSi:'දෙවියන්වහන්සේගේ යහපත්කම දැනගැනීමට උන්වහන්සේ සමඟ ඔබගේම සම්බන්ධතාවය තුළ අත්දැකීමක් ලබන්න. විශ්වාසයෙන් උන්වහන්සේ වෙත ළංවන්න.',meaningEn:'Discover God’s goodness through your own walk with Him. Draw near with trust and experience His care.',related:[['Psalm 100:5','ස්වාමීන්වහන්සේ යහපත්ය; උන්වහන්සේගේ කරුණාව සදාකාලිකය.'],['James 1:17','සෑම යහපත් දීමනාවක්ම දෙවියන්වහන්සේගෙන්ය.'],['Psalm 119:68','දෙවියන්වහන්සේ යහපත්ය; උන්වහන්සේ යහපත කරන සේක.']]},
  {ref:'John 14:27',si:'මම ඔබට සාමය තබා යමි; මාගේ සාමය ඔබට දෙමි. ඔබගේ සිත් කලබල නොවී බිය නොවන්න.',en:'Peace I leave with you, my peace I give unto you: let not your heart be troubled, neither let it be afraid.',meaningSi:'බාහිර තත්ත්වයන් වෙනස් වුවත් යේසුස්වහන්සේ දෙන සාමය තුළ සිත ස්ථිර කරගන්න. බිය සහ කනස්සල්ල උන්වහන්සේට භාර දෙන්න.',meaningEn:'Even when circumstances change, seek the peace Jesus gives. Entrust your fears and worries to Him.',related:[['Philippians 4:7','දෙවියන්වහන්සේගේ සාමය ඔබගේ සිත් රැකගනී.'],['Isaiah 26:3','උන්වහන්සේ කෙරෙහි විශ්වාසය තබන අයට සම්පූර්ණ සාමය ලැබේ.'],['Colossians 3:15','ක්‍රිස්තුස්වහන්සේගේ සාමය ඔබගේ සිත් තුළ පාලනය වේවා.']]},
  {ref:'Psalm 121:1-2',si:'මම කඳු දෙසට මාගේ ඇස් ඔසවමි; මාගේ උපකාරය කොතැනින් පැමිණේද? මාගේ උපකාරය අහසත් පොළොවත් මැවූ ස්වාමීන්වහන්සේගෙන්ය.',en:'I will lift up mine eyes unto the hills, from whence cometh my help. My help cometh from the LORD, which made heaven and earth.',meaningSi:'ඔබට උපකාර අවශ්‍ය වූ විට ඔබගේ බලාපොරොත්තුව දෙවියන්වහන්සේ වෙත යොමු කරන්න. සියල්ල මැවූ උන්වහන්සේ ඔබට උපකාර කිරීමට බලවත්ය.',meaningEn:'When you need help, lift your hope toward God. The Creator of heaven and earth is able to sustain you.',related:[['Psalm 46:1','දෙවියන්වහන්සේ විපතේදී ළඟ සිටින උපකාරයය.'],['Hebrews 4:16','කරුණාව සහ උපකාරය ලබාගැනීමට දෙවියන්වහන්සේ වෙත ළංවන්න.'],['Psalm 124:8','අපගේ උපකාරය ස්වාමීන්වහන්සේගේ නාමයෙන්ය.']]},
  {ref:'Lamentations 3:22-23',si:'ස්වාමීන්වහන්සේගේ කරුණාව නිසා අප විනාශ නොවෙමු; උන්වහන්සේගේ දයාව අවසන් නොවේ. එය සෑම උදෑසනකම අලුත්ය.',en:'It is of the LORD’S mercies that we are not consumed... They are new every morning: great is thy faithfulness.',meaningSi:'අතීතයේ වැරදි හෝ දුෂ්කරතා ඔබගේ අද දවසේ බලාපොරොත්තුව නැති නොකරන්න. දෙවියන්වහන්සේගේ කරුණාව සෑම උදෑසනකම අලුත් ආරම්භයක් ලබා දෙයි.',meaningEn:'Past mistakes and hardships do not have to define today. God’s mercy offers a fresh beginning each morning.',related:[['Psalm 30:5','රාත්‍රියේ දුක පැවතිය හැකි නමුත් උදෑසන ප්‍රීතිය පැමිණේ.'],['Isaiah 43:19','දෙවියන්වහන්සේ අලුත් දෙයක් කරන සේක.'],['2 Corinthians 5:17','ක්‍රිස්තුස්වහන්සේ තුළ අලුත් මැවීමක් ඇත.']]},
  {ref:'Matthew 5:16',si:'ඔබගේ ආලෝකය මිනිසුන් ඉදිරියේ බැබළෙන්නට ඉඩ දෙන්න; ඔවුන් ඔබගේ යහපත් ක්‍රියා දැක ස්වර්ගයේ සිටින ඔබගේ පියාණන්වහන්සේට ගෞරව කරනු ඇත.',en:'Let your light so shine before men, that they may see your good works, and glorify your Father which is in heaven.',meaningSi:'ඔබගේ යහපත් ක්‍රියා, කරුණාව සහ අවංකකම තුළින් දෙවියන්වහන්සේගේ ප්‍රේමය අන් අයට පෙන්වන්න. ඔබගේ ජීවිතය උන්වහන්සේට ගෞරවයක් වේවා.',meaningEn:'Let kindness, integrity, and good deeds reflect God’s love to others. May your life point people toward Him.',related:[['Ephesians 5:8','ආලෝකයේ දරුවන් ලෙස ජීවත් වන්න.'],['1 Peter 2:12','යහපත් ක්‍රියා තුළින් දෙවියන්වහන්සේට ගෞරවය ලැබේ.'],['Philippians 2:15','ලෝකය තුළ ආලෝකයන් ලෙස බැබළෙන්න.']]},
  {ref:'Psalm 37:4',si:'ස්වාමීන්වහන්සේ තුළ ප්‍රීති වන්න; උන්වහන්සේ ඔබගේ සිතේ ආශාවන් ඉටු කරන සේක.',en:'Delight thyself also in the LORD; and he shall give thee the desires of thine heart.',meaningSi:'දෙවියන්වහන්සේ සමඟ සම්බන්ධතාවය ඔබගේ ප්‍රීතියේ මූලාශ්‍රය කරගන්න. ඔබගේ ආශාවන් උන්වහන්සේට භාර දී, උන්වහන්සේගේ මඟපෙන්වීම සොයන්න.',meaningEn:'Make your relationship with God the source of joy. Entrust your desires to Him and seek His guidance.',related:[['Psalm 16:11','දෙවියන්වහන්සේගේ සම්මුඛයේ ප්‍රීතිය ඇත.'],['John 15:11','ක්‍රිස්තුස්වහන්සේගේ ප්‍රීතිය ඔබ තුළ පවතිනු ඇත.'],['Psalm 27:4','ස්වාමීන්වහන්සේගේ සම්මුහයේ සිටීමේ ආශාව.']]},
  {ref:'Romans 12:12',si:'බලාපොරොත්තුවෙන් ප්‍රීති වන්න; පීඩාවලදී ඉවසිලිවන්ත වන්න; යාච්ඤාවෙහි නිරතුරුව සිටින්න.',en:'Rejoicing in hope; patient in tribulation; continuing instant in prayer.',meaningSi:'අනාගතය ගැන බලාපොරොත්තුව තබාගන්න. අසීරු කාලයේ ඉවසීමෙන් සිටිමින් යාච්ඤාව අත් නොහරින්න. දිනපතා දෙවියන්වහන්සේ සමඟ කතා කරන්න.',meaningEn:'Hold on to hope, practice patience in hard seasons, and keep prayer as a steady part of daily life.',related:[['1 Thessalonians 5:17','නිරතුරුව යාච්ඤා කරන්න.'],['Hebrews 10:23','බලාපොරොත්තුවේ ප්‍රකාශය ස්ථිරව අල්ලාගන්න.'],['James 5:13','දුක් විඳින කෙනා යාච්ඤා කරාවා.']]},
  {ref:'Micah 6:8',si:'යුක්තියෙන් ක්‍රියා කිරීම, කරුණාවට ප්‍රේම කිරීම සහ ඔබගේ දෙවියන්වහන්සේ සමඟ නිහතමානීව ගමන් කිරීම යහපත් බව ඔබට පෙන්වා ඇත.',en:'...to do justly, and to love mercy, and to walk humbly with thy God.',meaningSi:'විශ්වාසය ක්‍රියාවෙන් පෙන්වන්න: සාධාරණව හැසිරෙන්න, කරුණාව දක්වන්න, සහ දෙවියන්වහන්සේ ඉදිරියේ නිහතමානීව ජීවත් වන්න.',meaningEn:'Put faith into practice: act fairly, love mercy, and live humbly in your walk with God.',related:[['Matthew 23:23','යුක්තිය, කරුණාව සහ විශ්වාසවන්තකම වැදගත්ය.'],['James 2:17','ක්‍රියා නැති විශ්වාසය මළය.'],['Ephesians 4:32','එකිනෙකාට කරුණාවන්තව සමාව දෙන්න.']]},
  {ref:'Numbers 6:24-26',si:'ස්වාමීන්වහන්සේ ඔබට ආශීර්වාද කර ඔබ රැකගන්නා සේක්වා; උන්වහන්සේගේ මුහුණ ඔබ කෙරෙහි බැබළී ඔබට කරුණාව දක්වන සේක්වා; ඔබට සාමය දෙන සේක්වා.',en:'The LORD bless thee, and keep thee: The LORD make his face shine upon thee, and be gracious unto thee: The LORD lift up his countenance upon thee, and give thee peace.',meaningSi:'අද දවස දෙවියන්වහන්සේගේ ආශීර්වාදය, රැකවරණය, කරුණාව සහ සාමය ඔබ සමඟ ඇති බව සිහි කරමින් ආරම්භ කරන්න. මේ ආශීර්වාදය අන් අයටත් ප්‍රාර්ථනා කරන්න.',meaningEn:'Begin today remembering God’s blessing, protection, grace, and peace. Extend this same blessing to others.',related:[['Psalm 67:1','දෙවියන්වහන්සේගේ කරුණාව සහ ආශීර්වාදය අප කෙරෙහි වේවා.'],['2 Thessalonians 3:16','සාමයේ ස්වාමීන්වහන්සේ ඔබට සාමය දෙන සේක්වා.'],['Psalm 121:7-8','ස්වාමීන්වහන්සේ ඔබ රැකගන්නා සේක.']]}
];

const localDate = new Date();
const dayStart = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate());

const dateEl = document.getElementById('date');
if (dateEl) {
  dateEl.textContent = localDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

const november2026 = {
  20: 0, 21: 1, 22: 2, 23: 3, 24: 4, 25: 5,
  26: 6, 27: 7, 28: 8, 29: 9, 30: 10
};

const novPlan = [
  {ref:'යෙසායා 6:8 / Isaiah 6:8', si:'“මම මෙහි සිටිමි; මා යවන්න” යනුවෙන් යෙසායා ප්‍රතිචාර දැක්වීය.', en:'Then said I, Here am I; send me.', meaningSi:'දෙවියන්වහන්සේගේ කැඳවීමට කැමැත්තෙන් ප්‍රතිචාර දක්වා සේවයට සූදානම් වීම.', meaningEn:'Respond willingly to God’s call and be ready to serve.', related:[['Exodus 3:10','දෙවියන්වහන්සේ මෝසෙස්ව යැවූ සේක.'],['1 Samuel 3:10','කතා කළ මැනව; ඔබගේ සේවකයා අසයි.']]},
  {ref:'කොලොස්සි 4:5–6 / Colossians 4:5-6', si:'පිටස්තරයන් සමඟ ප්‍රඥාවෙන් හැසිරෙන්න; අවස්ථාව ප්‍රයෝජනයට ගන්න.', en:'Walk in wisdom toward them that are without, redeeming the time.', meaningSi:'අන් අය සමඟ ප්‍රඥාවෙන් හා කරුණාවෙන් හැසිරෙන්න.', meaningEn:'Live wisely and speak to others with grace and kindness.', related:[['Ephesians 5:15-16','ප්‍රඥාවෙන් ජීවත් වී කාලය ප්‍රයෝජනයට ගන්න.'],['Proverbs 15:1','මෘදු පිළිතුර කෝපය පහ කරයි.']]},
  {ref:'මතෙව් 9:37-38 / Matthew 9:37-38', si:'අස්වැන්න බොහෝය, නමුත් සේවකයෝ ස්වල්පය.', en:'The harvest truly is plenteous, but the labourers are few.', meaningSi:'ශුභාරංචිය අවශ්‍ය අය වෙනුවෙන් යාච්ඤා කරන්න.', meaningEn:'Pray for those who need the good news and for willing workers.', related:[['Luke 10:2','අස්වැන්නට සේවකයන් එවන ලෙස යාච්ඤා කරන්න.'],['John 4:35','අස්වැන්න සඳහා ඇස් ඔසවා බලන්න.']]},
  {ref:'ක්‍රියා 13:47 / Acts 13:47', si:'මම ඔබව ජාතීන්ට ආලෝකයක් ලෙස තැබුවෙමි.', en:'I have set thee to be a light of the Gentiles.', meaningSi:'දෙවියන්වහන්සේගේ ගැළවීමේ පණිවිඩය බෙදාගන්න.', meaningEn:'Share God’s message of salvation with people everywhere.', related:[['Isaiah 49:6','ජාතීන්ට ආලෝකයක් වීමේ කැඳවීම.'],['Matthew 28:19','සියලු ජාතීන් වෙත ගොස් ගෝලයන් කරන්න.']]},
  {ref:'ක්‍රියා 1:8 / Acts 1:8', si:'ශුද්ධාත්මයාණන් ඔබ කෙරෙහි පැමිණි විට ඔබට බලය ලැබේ.', en:'Ye shall receive power, after that the Holy Ghost is come upon you.', meaningSi:'ශුද්ධාත්මයාණන්ගේ උපකාරයෙන් යේසුස්වහන්සේ ගැන සාක්ෂි දරන්න.', meaningEn:'Witness for Jesus with the help of the Holy Spirit.', related:[['Matthew 28:19-20','ගෝලයන් කරන්න.'],['2 Timothy 1:8','ස්වාමීන් ගැන සාක්ෂි දැරීමට ලජ්ජා නොවන්න.']]},
  {ref:'රෝම 10:14-15 / Romans 10:14-15', si:'ඔවුන් අසා නැති තැනැන්වහන්සේ ගැන විශ්වාස කරන්නේ කෙසේද?', en:'How shall they believe in him of whom they have not heard?', meaningSi:'අන් අයට ශුභාරංචිය ඇසීමට එය බෙදාගන්නා අය අවශ්‍යය.', meaningEn:'People need to hear the good news.', related:[['Isaiah 52:7','සාමයේ ශුභාරංචිය ගෙන එන්නා.'],['Mark 16:15','මුළු ලෝකයටම ශුභාරංචිය දේශනා කරන්න.']]},
  {ref:'2 තිමෝති 4:2 / 2 Timothy 4:2', si:'වචනය දේශනා කරන්න; සෑම විටම සූදානම්ව සිටින්න.', en:'Preach the word; be instant in season, out of season.', meaningSi:'දෙවියන්වහන්සේගේ වචනය ඉවසීමෙන් හා ප්‍රේමයෙන් බෙදාගන්න.', meaningEn:'Be ready to share God’s word with patience and love.', related:[['1 Peter 3:15','බලාපොරොත්තුව ගැන මෘදුකමින් පිළිතුරු දෙන්න.'],['Colossians 4:5-6','ප්‍රඥාවෙන් හැසිරෙමින් කරුණාවෙන් කතා කරන්න.']]},
  {ref:'ගීතාවලිය 96:3 / Psalm 96:3', si:'ජාතීන් අතර උන්වහන්සේගේ මහිමය ප්‍රකාශ කරන්න.', en:'Declare his glory among the heathen, his wonders among all people.', meaningSi:'දෙවියන්වහන්සේගේ යහපත් ක්‍රියා අන් අය සමඟ බෙදාගන්න.', meaningEn:'Share God’s goodness and wonderful works with others.', related:[['Psalm 105:1','ස්වාමීන්වහන්සේගේ ක්‍රියා ප්‍රකාශ කරන්න.'],['Mark 5:19','ස්වාමීන් කළ දේ ගැන කියන්න.']]},
  {ref:'මතෙව් 5:14 / Matthew 5:14', si:'ඔබ ලෝකයේ ආලෝකයය.', en:'Ye are the light of the world.', meaningSi:'කරුණාව හා යහපත් ක්‍රියා තුළින් අන් අයට ආලෝකයක් වන්න.', meaningEn:'Be a light to others through kindness and good deeds.', related:[['Matthew 5:16','ඔබගේ ආලෝකය බැබළෙන්නට ඉඩ දෙන්න.'],['Philippians 2:15','ලෝකය තුළ ආලෝකයන් ලෙස බැබළෙන්න.']]},
  {ref:'පිලිප්පි 2:14-15 / Philippians 2:14-15', si:'සියල්ල මැසිවිලි හා විවාද නැතිව කරන්න.', en:'Do all things without murmurings and disputings.', meaningSi:'ස්තුතිවන්තකම හා සාමය තෝරාගෙන අන් අයට ආදර්ශයක් වන්න.', meaningEn:'Choose gratitude and peace instead of grumbling and arguments.', related:[['Colossians 3:23','සෑම දෙයක්ම හදවතින් කරන්න.'],['Ephesians 4:29','අන් අය ගොඩනඟන වචන කතා කරන්න.']]},
  {ref:'1 පේත්‍රස් 2:9 / 1 Peter 2:9', si:'ඔබ තෝරාගත් පරම්පරාවක්, රාජකීය පූජකත්වයක්, ශුද්ධ ජාතියක්ය.', en:'Ye are a chosen generation, a royal priesthood, an holy nation.', meaningSi:'දෙවියන්වහන්සේගේ යහපත්කම ඔබගේ ජීවිතයෙන් පෙන්වන්න.', meaningEn:'Let your life reflect God’s goodness.', related:[['Isaiah 43:21','දෙවියන්වහන්සේගේ ප්‍රශංසාව ප්‍රකාශ කරන්න.'],['Ephesians 5:8','ආලෝකයේ දරුවන් ලෙස ජීවත් වන්න.']]}
];

const novemberSinhalaTexts = [
  'එවිට: මම කවරෙකු යවම්ද? අප උදෙසා යන්නේ කවුදැයි කියන්නා වූ ස්වාමීන්වහන්සේගේ හඬ මට ඇසුණේය. මමද: මෙන්න මම මෙහිය; මා යැවුව මැනවයි කීමි.',
  '5 නුඹලා ප්‍රස්තාව අල්ලාගනිමින්, පිටත සිටින්නන් කෙරෙහි ප්‍රඥාවෙන් ක්‍රියාකරන්න. 6 නුඹලා එකිනෙකාට උත්තරදිය යුතු කෙසේදැයි දැනගන්නා පිණිස, නුඹලාගේ කථාව නිතරම ලුණෙන් රසවත්වූ, අනුග්‍රහයෙන් යුක්තවූ කථාවක් වේවා.',
  '37 එවිට උන්වහන්සේ තමන් ගෝලයන්ට කථාකොට: ගොයම නම් බොහෝය, නුමුත් ගොවියෝ ස්වල්ප දෙනෙක්ය. 38 එබැවින් තමන් ගොයම් කැපීමට ගොවියන් එවන ලෙස ගොයමේ ස්වාමියාට යාච්ඤාකරන්නැයි කීසේක.',
  'මක්නිසාද ස්වාමීන්වහන්සේ අපට මෙසේ අණකළසේක, කෙසේදයත්: නුඹ පොළොවේ සීමා දක්වා ගැළවීම වන පිණිස අන්‍යජාතීන්ට නුඹ එළියක් කොට තැබුවෙමියි කියා තිබේයයි කීවෝය.',
  'නුමුත් ශුද්ධාත්මයාණන්වහන්සේ නුඹලා කෙරෙහි පැමිණි කල නුඹලා බලය ලබන්නහුය. එවිට නුඹලා යෙරුසලමෙහිද මුළු යුදයෙහිද සමාරියෙහිද පොළොවේ සීමාව දක්වාද මාගේ සාක්ෂිකාරයෝ වන්නහුයයි කීසේක.',
  '14 එසේ නම් ඔවුන් තමුන් විසින් අදහා නොගත්තාවූ කෙනෙකුට යාච්ඤාකරන්නේ කොහොමද? තමුන් නොඇසුවාවූ කෙනෙකු අදහන්නේ කොහොමද? දේශනාකරන්නෙකු නැතුව අසන්නේ කොහොමද? 15 සමහරු යවනු ලැබුවොත් මිස දේශනාකරන්නේ කොහොමද? මේ සම්බන්ධව: යහපත් දේ ගැන ශුභාරංචිය ගෙනෙන්නන්ගේ පාද කොපමණ අලංකාරද කියා ලියා තිබේ.',
  'වචනය දේශනා කරන්න; කලටත් අකලටත් වැඩේ යෙදී සිටින්න; සියලු ආකාර ඉවසිලිවන්තකමෙන් සහ ඉගැන්වීමෙන් තරවටුකර, අවවාදකර, අනුශාසනාකරන්න කියාය.',
  'උන්වහන්සේගේ මහිමය ජාතීන් අතරේද උන්වහන්සේගේ ආශ්චර්ය ක්‍රියා සියලු මනුෂ්‍ය වර්ගයන් අතරේද ප්‍රකාශ කරව්.',
  'නුඹලා ලෝකයේ ආලෝකයය. කන්දක් මුදුනෙහි තිබෙන නුවරක් සඟවන්ට නොහැකිය.',
  '14 මැසිවිලිද විවාදද නැතුව සියල්ල කරපල්ලා; 15 වංකවූ හිතුවක්කාරවූ පරම්පරාවක් අතරේ නුඹලා නිදොස්ව, අහිංසකව, දෙවියන්වහන්සේගේ නිර්දෝෂ දරුවන් වන පිණිස, ඔවුන් අතරේ ජීවනයේ වචනය පාමින් ආලෝකවල් මෙන් ලෝකයෙහි දක්නා ලැබෙන්නහුය.',
  'නුමුත් අන්ධකාරයෙන් තමන්ගේ විස්මපත් ආලෝකයට නුඹලා කැඳවාගත් තැනන්වහන්සේගේ උත්කෘෂ්ටතාවන් දක්වන පිණිස නුඹලා වනාහි තෝරාගත් වංශයක්ද රාජකීය පූජකයෝද ශුද්ධවූ ජාතියක්ද දෙවියන්වහන්සේ සන්තක සෙනඟක්ද වන්නහුය.'
];

novPlan.forEach((verse, index) => {
  verse.si = novemberSinhalaTexts[index];
  verse.fromNovPlan = true;
});

let customCloudVerses = [];
let activeVerse = null;

function getAllVerses() {
  return [...customCloudVerses, ...verses];
}

function displayVerse(verse) {
  if (!verse) return;
  const refEl = document.getElementById('reference');
  const siEl = document.getElementById('sinhala');
  const enEl = document.getElementById('english');
  const meaningSiEl = document.getElementById('meaningSi');
  const meaningEnEl = document.getElementById('meaningEn');
  const relatedEl = document.getElementById('related');

  if (refEl) refEl.textContent = verse.ref;
  if (siEl) siEl.textContent = `“${verse.si}”`;
  if (enEl) enEl.textContent = `“${verse.en || ''}”`;
  if (meaningSiEl) meaningSiEl.textContent = verse.meaningSi || '';
  if (meaningEnEl) meaningEnEl.textContent = verse.meaningEn || '';

  if (relatedEl) {
    const relatedList = Array.isArray(verse.related) ? verse.related : [];
    relatedEl.innerHTML = relatedList.map(([ref, desc], index) => `
      <div style="margin-bottom:10px;">
        <button type="button"
          class="related-verse-button"
          data-related-index="${index}"
          style="display:block;width:100%;text-align:left;padding:12px 14px;">
          ${ref} — සම්පූර්ණ පදය බලන්න
        </button>
        <div style="display:none;margin-top:10px;line-height:1.8;color:#4b6356;">
          ${desc}
        </div>
      </div>
    `).join('');

    relatedEl.querySelectorAll('.related-verse-button').forEach(button => {
      apply3DButtonStyle(button, "ivory");
      button.addEventListener('click', () => {
        const verseText = button.nextElementSibling;
        const isHidden = verseText.style.display === 'none';
        verseText.style.display = isHidden ? 'block' : 'none';
        button.textContent = button.textContent.replace(
          isHidden ? 'සම්පූර්ණ පදය බලන්න' : 'පදය සඟවන්න',
          isHidden ? 'පදය සඟවන්න' : 'සම්පූර්ණ පදය බලන්න'
        );
      });
    });
  }
}

function resolveDefaultVerse() {
  const pool = getAllVerses();
  const dayIndex = Math.floor(dayStart.getTime() / 86400000) % pool.length;
  return (
    localDate.getFullYear() === 2026 &&
    localDate.getMonth() === 10 &&
    november2026[localDate.getDate()] !== undefined
  )
    ? novPlan[november2026[localDate.getDate()]]
    : pool[dayIndex];
}

const today = resolveDefaultVerse();
activeVerse = today;
displayVerse(activeVerse);

const novemberList = document.getElementById('novemberList');

if (novemberList) {
  const verseDetail = document.createElement('section');
  verseDetail.style.display = 'none';
  verseDetail.style.padding = '18px';
  verseDetail.style.marginTop = '12px';
  verseDetail.style.border = '1px solid #c6d4ca';
  verseDetail.style.borderRadius = '12px';

  const verseTitle = document.createElement('h3');
  const verseText = document.createElement('p');
  verseText.style.fontSize = '1.15rem';
  verseText.style.lineHeight = '1.9';

  const backButton = document.createElement('button');
  backButton.type = 'button';
  backButton.textContent = '← නැවත පද ලැයිස්තුවට';
  apply3DButtonStyle(backButton, "forest");
  backButton.addEventListener('click', () => {
    verseDetail.style.display = 'none';
    novemberList.style.display = '';
  });

  verseDetail.append(verseTitle, verseText, backButton);
  novemberList.insertAdjacentElement('afterend', verseDetail);

  const currentNovDay =
    localDate.getFullYear() === 2026 && localDate.getMonth() === 10
      ? localDate.getDate()
      : null;

  novemberList.innerHTML = novPlan.map((verse, index) => {
    const dayNum = index + 20;
    return `
      <button type="button"
        class="nov-verse-button"
        data-index="${index}"
        data-day="${dayNum}"
        style="display:block;width:100%;text-align:left;margin-bottom:14px;padding:14px 16px;cursor:pointer;">
        November ${dayNum} — ${verse.ref}
      </button>
    `;
  }).join('');

  novemberList.querySelectorAll('.nov-verse-button').forEach(button => {
    const isTodayBtn = Number(button.dataset.day) === currentNovDay;
    apply3DButtonStyle(button, isTodayBtn ? "forest" : "ivory");

    button.addEventListener('click', () => {
      const verse = novPlan[Number(button.dataset.index)];
      if (!verse) return;

      activeVerse = verse;
      verseTitle.textContent = verse.ref;
      verseText.textContent = verse.si;
      novemberList.style.display = 'none';
      verseDetail.style.display = 'block';

      displayVerse(verse);
      loadReflectionForRef(activeVerse.ref);
      document.getElementById('reference')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    });
  });
}

function toast(message) {
  const element = document.getElementById('toast');
  if (!element) return;
  element.textContent = message;
  element.style.display = 'block';
  setTimeout(() => {
    element.style.display = 'none';
  }, 2200);
}

function getFavorites() {
  return JSON.parse(localStorage.getItem('dailyword-favorites') || '[]');
}

function renderFavorites() {
  const favorites = getFavorites();
  const element = document.getElementById('favorites');
  if (!element) return;

  if (!favorites.length) {
    element.innerHTML =
      '<div style="color:#4b6356;font-size:13px">No saved verses yet.</div>';
    return;
  }

  element.innerHTML = favorites.map(verse => `
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;background:#ffffff;border:1px solid #c6d4ca;border-radius:12px;padding:12px;margin-bottom:8px;">
      <span><strong>${verse.ref}</strong><br>${verse.si}</span>
      <button type="button" data-ref="${verse.ref}">Remove</button>
    </div>
  `).join('');

  element.querySelectorAll('button').forEach(button => {
    apply3DButtonStyle(button, "forest");
    button.addEventListener('click', () => {
      const updated = getFavorites().filter(
        verse => verse.ref !== button.dataset.ref
      );
      localStorage.setItem('dailyword-favorites', JSON.stringify(updated));
      renderFavorites();
    });
  });
}

document.getElementById('save')?.addEventListener('click', () => {
  const targetVerse = activeVerse || today;
  const favorites = getFavorites();

  if (favorites.some(verse => verse.ref === targetVerse.ref)) {
    toast('This verse is already saved');
    return;
  }

  favorites.unshift({
    ref: targetVerse.ref,
    si: targetVerse.si,
    en: targetVerse.en
  });

  localStorage.setItem('dailyword-favorites', JSON.stringify(favorites));
  renderFavorites();
  toast('Verse saved to favorites');
});

document.getElementById('share')?.addEventListener('click', async () => {
  const targetVerse = activeVerse || today;
  const text = `Daily Word – ${targetVerse.ref}\n\n${targetVerse.si}\n\n${targetVerse.en}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Daily Word', text });
    } catch {
      console.log('Share cancelled');
    }
  } else {
    try {
      await navigator.clipboard.writeText(text);
      toast('Verse copied to clipboard');
    } catch {
      toast('Unable to share');
    }
  }
});

const reflectionBox = document.getElementById('reflection');
const saveReflectionButton = document.getElementById('saveReflection');

let currentUser = null;

async function connectFirebase() {
  if (auth.currentUser) return auth.currentUser;
  if (currentUser) return currentUser;
  const result = await signInAnonymously(auth);
  currentUser = result.user;
  return currentUser;
}

function reflectionDocumentId(ref) {
  return encodeURIComponent(ref);
}

async function saveReflectionToFirebase(ref, value) {
  const user = await connectFirebase();
  const reflectionDoc = doc(
    db,
    'users',
    user.uid,
    'reflections',
    reflectionDocumentId(ref)
  );

  await setDoc(reflectionDoc, {
    verseRef: ref,
    reflection: value,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

async function deleteReflectionFromFirebase(docId) {
  const user = await connectFirebase();
  const reflectionDoc = doc(db, 'users', user.uid, 'reflections', docId);
  await deleteDoc(reflectionDoc);
}

async function getReflectionFromFirebase(ref) {
  const user = await connectFirebase();
  const reflectionDoc = doc(
    db,
    'users',
    user.uid,
    'reflections',
    reflectionDocumentId(ref)
  );
  return await getDoc(reflectionDoc);
}

async function loadReflectionForRef(ref) {
  if (!reflectionBox) return;
  reflectionBox.value = localStorage.getItem('dailyword-reflection-' + ref) || '';
  try {
    const snapshot = await getReflectionFromFirebase(ref);
    if (snapshot.exists()) {
      const data = snapshot.data();
      reflectionBox.value = data.reflection || '';
      localStorage.setItem('dailyword-reflection-' + ref, reflectionBox.value);
    }
  } catch (error) {
    console.error('Could not load reflection:', error);
  }
}

async function loadReflectionHistory() {
  if (!saveReflectionButton) return;
  const historyId = 'reflectionHistory';

  let historyElement = document.getElementById(historyId);
  if (!historyElement) {
    historyElement = document.createElement('div');
    historyElement.id = historyId;
    historyElement.style.marginTop = '20px';
    saveReflectionButton.insertAdjacentElement('afterend', historyElement);
  }

  historyElement.innerHTML = '<h3>Reflection History</h3>';

  try {
    const user = await connectFirebase();
    const reflectionsRef = collection(db, 'users', user.uid, 'reflections');
    const historyQuery = query(reflectionsRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(historyQuery);

    if (snapshot.empty) {
      historyElement.innerHTML += '<p>No saved reflections yet.</p>';
      return;
    }

    snapshot.forEach(item => {
      const data = item.data();

      const entry = document.createElement('div');
      entry.style.padding = '12px';
      entry.style.margin = '8px 0';
      entry.style.border = '1px solid #c6d4ca';
      entry.style.borderRadius = '8px';

      const heading = document.createElement('strong');
      heading.textContent = data.verseRef || 'Saved reflection';

      const paragraph = document.createElement('p');
      paragraph.textContent = data.reflection || '';

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.textContent = 'Delete';
      apply3DButtonStyle(deleteButton, "forest");
      deleteButton.style.background = "linear-gradient(180deg, #b83b46 0%, #8f242e 100%)";

      deleteButton.addEventListener('click', async () => {
        try {
          await deleteReflectionFromFirebase(item.id);
          localStorage.removeItem('dailyword-reflection-' + (data.verseRef || ''));
          toast('Reflection deleted');
          await loadReflectionHistory();
        } catch (error) {
          console.error('Could not delete reflection:', error);
          toast('Unable to delete reflection');
        }
      });

      entry.append(heading, paragraph, deleteButton);
      historyElement.appendChild(entry);
    });
  } catch (error) {
    console.error('Could not load reflection history:', error);
    historyElement.innerHTML += '<p>Unable to load reflection history.</p>';
  }
}

saveReflectionButton?.addEventListener('click', async () => {
  if (!reflectionBox) return;
  const targetRef = (activeVerse || today).ref;
  const value = reflectionBox.value.trim();
  localStorage.setItem('dailyword-reflection-' + targetRef, value);

  try {
    await saveReflectionToFirebase(targetRef, value);
    toast('Reflection saved');
    await loadReflectionHistory();
  } catch (error) {
    console.error('Could not save reflection:', error);
    toast('Saved locally; cloud sync failed');
  }
});

let extractedDocxLines = [];

function parseLineToVerseObject(rawLine, englishTranslation) {
  const trimmed = rawLine.trim();
  const match = trimmed.match(/^([1-3]?\s*[A-Za-z\u0D80-\u0DFF]+\s+\d+:\d+(?:-\d+)?)\s*[:\-–—]\s*(.+)$/);

  const ref = match ? match[1].trim() : `Admin Verse · ${trimmed.slice(0, 24)}`;
  const si = match ? match[2].trim() : trimmed;

  let related = [
    ['Psalm 119:105', 'ඔබගේ වචනය මාගේ පාදවලට පහනක්ද මාගේ මාවතට ආලෝකයක්ද වේ.'],
    ['John 17:17', 'සත්‍යය තුළින් ඔවුන් ශුද්ධ කරන්න; ඔබගේ වචනය සත්‍යයය.']
  ];

  if (/ප්‍රේම|ආදර|සෙනෙහස/u.test(si)) {
    related = [
      ['1 Corinthians 13:4', 'ප්‍රේමය ඉවසිලිවන්තය; ප්‍රේමය කරුණාවන්තය.'],
      ['1 John 4:19', 'උන්වහන්සේ මුලින් අපට ප්‍රේම කළ නිසා අපි ප්‍රේම කරමු.']
    ];
  } else if (/බිය|සාමය|ශක්ති|විශ්වාස/u.test(si)) {
    related = [
      ['Isaiah 41:10', 'බිය නොවන්න, මක්නිසාද මම ඔබ සමඟ සිටිමි.'],
      ['Philippians 4:7', 'සියලු බුද්ධිය ඉක්මවන දෙවියන්වහන්සේගේ සාමය ඔබගේ සිත් රැකගනී.']
    ];
  }

  return {
    ref,
    si,
    en: englishTranslation || '',
    meaningSi: '1995 සිංහල සංශෝධිත පැරණි අනුවාදයේ (ROV) සන්දර්භයට අනුව මෙම පදයේ මූලික අදහස හා දෛනික මඟ පෙන්වීම මෙනෙහි කරන්න.',
    meaningEn: 'Reflect on the core message and daily guidance of this passage in context.',
    related
  };
}

async function translateSiToEnOnline(text) {
  if (!text) return '';
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=si|en`
    );
    if (!res.ok) return '';
    const data = await res.json();
    return data?.responseData?.translatedText || '';
  } catch (err) {
    console.warn('Translation error:', err);
    return '';
  }
}

function renderCustomVersesManagerList() {
  const container = document.getElementById('customVersesList');
  if (!container) return;

  if (!customCloudVerses.length) {
    container.innerHTML = '<div style="color:#4b6356;font-size:13px;">No admin-uploaded verses yet.</div>';
    return;
  }

  container.innerHTML = customCloudVerses.map(item => `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;background:#ffffff;border:1px solid #c6d4ca;border-radius:12px;padding:12px;margin-top:8px;">
      <span>
        <strong>${item.ref}</strong><br>
        ${item.si}<br>
        <small style="color:#4b6356;">${item.en || ''}</small>
      </span>
      <button type="button" class="delete-custom-verse-btn" data-id="${item.id}">Delete</button>
    </div>
  `).join('');

  container.querySelectorAll('.delete-custom-verse-btn').forEach(btn => {
    apply3DButtonStyle(btn, "forest");
    btn.addEventListener('click', async () => {
      const docId = btn.dataset.id;
      if (!docId) return;
      try {
        await deleteDoc(doc(db, 'customVerses', docId));
        toast('Uploaded verse removed');
      } catch (err) {
        console.error('Failed to delete custom verse:', err);
        toast('Unable to delete (check Admin login)');
      }
    });
  });
}

function startLiveCustomVersesSync() {
  try {
    const cached = localStorage.getItem(CUSTOM_VERSES_CACHE_KEY);
    if (cached) {
      customCloudVerses = JSON.parse(cached) || [];
      renderCustomVersesManagerList();
    }
  } catch {}

  const q = query(collection(db, 'customVerses'), orderBy('createdAt', 'desc'));
  onSnapshot(
    q,
    snapshot => {
      customCloudVerses = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      localStorage.setItem(CUSTOM_VERSES_CACHE_KEY, JSON.stringify(customCloudVerses));
      renderCustomVersesManagerList();

      if (customCloudVerses.length > 0 && !activeVerse?.fromNovPlan) {
        activeVerse = customCloudVerses[0];
        displayVerse(activeVerse);
      }
    },
    err => {
      console.warn('Live verses listener error:', err);
    }
  );
}

function setupAdminPanel() {
  const emailInput = document.getElementById('adminEmail');
  const passInput = document.getElementById('adminPassword');
  const loginBtn = document.getElementById('adminLoginBtn');
  const logoutBtn = document.getElementById('adminLogoutBtn');
  const loginSection = document.getElementById('adminLoginSection');
  const editorSection = document.getElementById('adminEditorSection');
  const docxFileInput = document.getElementById('docxFileInput');
  const previewBox = document.getElementById('docxPreviewBox');
  const publishBtn = document.getElementById('publishDocxBtn');

  onAuthStateChanged(auth, user => {
    const isAdmin = Boolean(
      user && !user.isAnonymous && ADMIN_EMAILS.includes((user.email || '').toLowerCase())
    );
    if (loginSection) loginSection.style.display = isAdmin ? 'none' : 'block';
    if (editorSection) editorSection.style.display = isAdmin ? 'block' : 'none';
  });

  loginBtn?.addEventListener('click', async () => {
    const email = (emailInput?.value || '').trim();
    const password = passInput?.value || '';
    if (!email || !password) {
      toast('Enter admin email and password');
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast('Admin logged in');
    } catch (err) {
      console.error('Admin login failed:', err);
      toast('Invalid admin credentials');
    }
  });

  logoutBtn?.addEventListener('click', async () => {
    try {
      await signOut(auth);
      toast('Admin logged out');
    } catch (err) {
      console.error('Logout error:', err);
    }
  });

  docxFileInput?.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!window.mammoth) {
      toast('mammoth.js not loaded');
      return;
    }

    const arrayBuffer = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    extractedDocxLines = result.value
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    if (previewBox) {
      previewBox.innerHTML =
        `<strong>${extractedDocxLines.length} lines found:</strong><br>` +
        extractedDocxLines.slice(0, 6).map(l => `• ${l}`).join('<br>');
    }
  });

  publishBtn?.addEventListener('click', async () => {
    if (!extractedDocxLines.length) {
      toast('Select a .docx file first');
      return;
    }

    publishBtn.disabled = true;
    publishBtn.textContent = 'Translating & Publishing...';

    try {
      for (const line of extractedDocxLines) {
        const enText = await translateSiToEnOnline(line);
        const verseObj = parseLineToVerseObject(line, enText);
        const docId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        await setDoc(doc(db, 'customVerses', docId), {
          ...verseObj,
          createdAt: serverTimestamp()
        });
      }

      toast(`Published ${extractedDocxLines.length} verses to all users`);
      extractedDocxLines = [];
      if (docxFileInput) docxFileInput.value = '';
      if (previewBox) previewBox.innerHTML = '';
    } catch (err) {
      console.error('Publish failed:', err);
      toast('Publish failed — check Firestore rules & Admin login');
    } finally {
      publishBtn.disabled = false;
      publishBtn.textContent = 'Translate & Publish';
    }
  });
}

applyThemeCardShine();
decorateStaticButtons();
setupAdminPanel();
startLiveCustomVersesSync();
renderFavorites();
loadReflectionForRef(today.ref);
loadReflectionHistory();
