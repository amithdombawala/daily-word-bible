import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js';
import { getAuth, signInAnonymously } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, query, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js';

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

const verses = [
  {ref:'Philippians 4:13', si:'මා ශක්තිමත් කරන ක්‍රිස්තුස්වහන්සේ තුළින් මට සියල්ල කළ හැකිය.', en:'I can do all things through Christ which strengtheneth me.', meaningSi:'අපගේ ශක්තිය අප තුළින් පමණක් නොව ක්‍රිස්තුස්වහන්සේ තුළින් ලැබේ. අභියෝග හමුවේ තනිවම නොසිට උන්වහන්සේගේ උපකාරය විශ්වාස කරන්න.', meaningEn:'Our strength does not come only from ourselves. Through Christ, we can face challenges with courage and trust rather than feeling alone.', related:[['Isaiah 40:31','දෙවියන්වහන්සේ කෙරෙහි බලා සිටින අයට අලුත් ශක්තිය ලැබේ.'],['2 Corinthians 12:9','දුර්වලකම තුළ දෙවියන්වහන්සේගේ කරුණාව ප්‍රමාණවත්ය.'],['Psalm 28:7','ස්වාමීන්වහන්සේ අපගේ ශක්තිය සහ පලිහය.'],['Ephesians 6:10','ස්වාමීන්වහන්සේ තුළ ශක්තිමත් වන්න.']]},
  {ref:'Proverbs 3:5', si:'ඔබගේ මුළු හදවතින්ම ස්වාමීන්වහන්සේ කෙරෙහි විශ්වාස කරන්න; ඔබගේම අවබෝධය මත පමණක් රඳා නොසිටින්න.', en:'Trust in the LORD with all thine heart; and lean not unto thine own understanding.', meaningSi:'සෑම දෙයක්ම අපට පැහැදිලි නොවන අවස්ථාවලදීත් දෙවියන්වහන්සේ කෙරෙහි විශ්වාසය තබන්න. අපගේ සීමිත දැනුමට වඩා උන්වහන්සේගේ මඟපෙන්වීම විශ්වාස කළ හැකිය.', meaningEn:'When life is unclear, trust God beyond what you can understand. His wisdom is greater than our limited perspective.', related:[['Proverbs 3:6','ඔබගේ සියලු මාර්ගවල උන්වහන්සේ පිළිගන්න; උන්වහන්සේ ඔබගේ මාර්ග සෘජු කරනු ඇත.'],['Psalm 37:5','ඔබගේ මාර්ගය ස්වාමීන්වහන්සේට භාර දෙන්න.'],['Isaiah 26:3','දෙවියන්වහන්සේ කෙරෙහි විශ්වාස කරන අයට සාමය ලැබේ.'],['Jeremiah 17:7','ස්වාමීන්වහන්සේ කෙරෙහි විශ්වාස කරන තැනැත්තා ආශීර්වාද ලබයි.']]},
  {ref:'Matthew 11:28', si:'වෙහෙසට පත්ව බර උසුලන සියල්ලෙනි, මා වෙත එන්න; මම ඔබට විවේකය දෙන්නෙමි.', en:'Come unto me, all ye that labour and are heavy laden, and I will give you rest.', meaningSi:'ඔබගේ සිතේ බර, වෙහෙස සහ කනස්සල්ල තනිවම දරාගැනීමට අවශ්‍ය නැත. යේසුස්වහන්සේ වෙත පැමිණ ඒවා උන්වහන්සේට භාර දෙන්න.', meaningEn:'You do not have to carry every burden alone. Jesus invites you to come to Him and find rest for your heart and soul.', related:[['Psalm 55:22','ඔබගේ බර ස්වාමීන්වහන්සේ මත තබන්න.'],['John 14:27','යේසුස්වහන්සේ තම සාමය අපට දෙන සේක.'],['1 Peter 5:7','ඔබගේ සියලු කනස්සල්ල උන්වහන්සේ මත තබන්න.'],['Psalm 23:1-3','ස්වාමීන්වහන්සේ මඟ පෙන්වා ආත්මය ප්‍රබෝධමත් කරන සේක.']]},
  {ref:'Psalm 23:1', si:'ස්වාමීන්වහන්සේ මාගේ එඬේරාය; මට කිසි අඩුවක් නොවන්නේය.', en:'The LORD is my shepherd; I shall not want.', meaningSi:'එඬේරෙකු තම බැටළුවන් රැකබලා ගන්නා සේ දෙවියන්වහන්සේ අප ගැන සැලකිලිමත් වන සේක. අපට අවශ්‍ය මඟපෙන්වීම, ආරක්ෂාව සහ රැකවරණය උන්වහන්සේගෙන් ලැබේ.', meaningEn:'Like a shepherd caring for sheep, God watches over us. We can trust His guidance, care, and provision.', related:[['John 10:11','යේසුස්වහන්සේ යහපත් එඬේරාය.'],['Psalm 34:10','ස්වාමීන්වහන්සේ සොයන අයට යහපත් දේවලින් අඩුවක් නොවේ.'],['Matthew 6:31-33','දෙවියන්වහන්සේ අපගේ අවශ්‍යතා දන්නා සේක.'],['Isaiah 40:11','උන්වහන්සේ තම රැළ මෘදු ලෙස රැකබලා ගන්නා සේක.']]},
  {ref:'Romans 8:28', si:'දෙවියන්වහන්සේට ප්‍රේම කරන අයට, උන්වහන්සේගේ අරමුණ අනුව කැඳවනු ලැබූ අයට, සියල්ල යහපත සඳහා ක්‍රියා කරන බව අපි දනිමු.', en:'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.', meaningSi:'සෑම සිදුවීමක්ම අපට හොඳ ලෙස පෙනෙන්නේ නැත. නමුත් අසීරු කාලයන් තුළ පවා දෙවියන්වහන්සේ යහපත් අරමුණක් ඉටු කිරීමට ක්‍රියා කරන බව විශ්වාස කිරීමට මෙම පදය අපට මතක් කර දෙයි.', meaningEn:'Not every circumstance feels good, but this verse reminds us that God can work through even difficult seasons toward His good purpose.', related:[['Genesis 50:20','අයහපත සඳහා අදහස් කළ දෙයක් දෙවියන්වහන්සේ යහපත සඳහා හැරවූ සේක.'],['Jeremiah 29:11','දෙවියන්වහන්සේගේ අරමුණු බලාපොරොත්තුව සහ අනාගතය ලබා දෙයි.'],['James 1:2-4','පරීක්ෂාවන් තුළින් ඉවසීම වර්ධනය වේ.'],['Psalm 121:2','අපගේ උපකාරය අහසත් පොළොවත් මැවූ ස්වාමීන්වහන්සේගෙන්ය.']]},
  {ref:'Joshua 1:9', si:'ධෛර්යවත් වී ශක්තිමත්ව සිටින්න. බිය නොවන්න; කලබල නොවන්න; ඔබ යන සෑම තැනකම ඔබගේ දෙවිවූ ස්වාමීන්වහන්සේ ඔබ සමඟ සිටින සේක.', en:'Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.', meaningSi:'අලුත් ආරම්භයන් සහ නොදන්නා අනාගතය බිය උපදවන්න පුළුවන්. නමුත් දෙවියන්වහන්සේ ඔබ සමඟ සිටින බව මතක තබාගෙන ධෛර්යයෙන් ඉදිරියට යන්න.', meaningEn:'New beginnings and uncertainty can be frightening. Remember that God is with you, and take your next step with courage.', related:[['Deuteronomy 31:6','ධෛර්යවත් වන්න; දෙවියන්වහන්සේ ඔබ අත් නොහරින සේක.'],['Psalm 27:1','ස්වාමීන්වහන්සේ අපගේ ආලෝකය සහ ගැළවීමය; අප බිය විය යුත්තේ කාටද?'],['Isaiah 41:10','බිය නොවන්න; දෙවියන්වහන්සේ ඔබ සමඟ සිටින සේක.'],['2 Timothy 1:7','දෙවියන්වහන්සේ බිය නොව ශක්තිය, ප්‍රේමය සහ සංයමය දෙන සේක.']]},
  {ref:'1 Corinthians 13:4', si:'ප්‍රේමය ඉවසිලිවන්තය; ප්‍රේමය කරුණාවන්තය. එය ඊර්ෂ්‍යා නොකරයි; පුරසාරම් දොඩන්නේ නැත; අහංකාර නොවේ.', en:'Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up.', meaningSi:'සැබෑ ප්‍රේමය වචනවලට පමණක් සීමා නොවේ. එය ඉවසීම, කරුණාව, අන් අයට ගෞරවය සහ නිහතමානීකම තුළින් පෙන්වයි. අද ඔබගේ ක්‍රියාවකින් කෙනෙකුට ප්‍රේමය පෙන්වන්න.', meaningEn:'True love is more than words. It is shown through patience, kindness, respect, and humility. Choose one action today to show love to someone.', related:[['John 13:34','එකිනෙකාට ප්‍රේම කරන්න යන නව ආඥාව.'],['1 John 4:7','එකිනෙකාට ප්‍රේම කරමු; ප්‍රේමය දෙවියන්වහන්සේගෙන්ය.'],['Colossians 3:14','සියල්ලට ඉහළින් ප්‍රේමය පැළඳගන්න.'],['Romans 12:10','සහෝදර ප්‍රේමයෙන් එකිනෙකාට ආදරය කරන්න.']]}
,
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
document.getElementById('date').textContent =
  localDate.toLocaleDateString(undefined, {
    weekday:'long',
    year:'numeric',
    month:'long',
    day:'numeric'
  });
const november2026 = {
  20: 0,
  21: 1,
  22: 2,
  23: 3,
  24: 4,
  25: 5,
  26: 6,
  27: 7,
  28: 8,
  29: 9,
  30: 10
};
const novPlan = [
  {
    ref:'Isaiah 6:8',
    si:'“මම මෙහි සිටිමි; මා යවන්න” යනුවෙන් යෙසායා ප්‍රතිචාර දැක්වීය.',
    en:'Then said I, Here am I; send me.',
    meaningSi:'දෙවියන්වහන්සේගේ කැඳවීමට කැමැත්තෙන් ප්‍රතිචාර දක්වා සේවයට සූදානම් වීම.',
    meaningEn:'Respond willingly to God’s call and be ready to serve.',
    related:[['Exodus 3:10','දෙවියන්වහන්සේ මෝසෙස්ව යැවූ සේක.'],['1 Samuel 3:10','කතා කළ මැනව; ඔබගේ සේවකයා අසයි.']]
  },
  {
    ref:'Colossians 4:5-6',
    si:'පිටස්තරයන් සමඟ ප්‍රඥාවෙන් හැසිරෙන්න; අවස්ථාව ප්‍රයෝජනයට ගන්න.',
    en:'Walk in wisdom toward them that are without, redeeming the time.',
    meaningSi:'අන් අය සමඟ ප්‍රඥාවෙන් හා කරුණාවෙන් හැසිරෙන්න.',
    meaningEn:'Live wisely and speak to others with grace and kindness.',
    related:[['Ephesians 5:15-16','ප්‍රඥාවෙන් ජීවත් වී කාලය ප්‍රයෝජනයට ගන්න.'],['Proverbs 15:1','මෘදු පිළිතුර කෝපය පහ කරයි.']]
  },
  {
    ref:'Matthew 9:37-38',
    si:'අස්වැන්න බොහෝය, නමුත් සේවකයෝ ස්වල්පය.',
    en:'The harvest truly is plenteous, but the labourers are few.',
    meaningSi:'ශුභාරංචිය අවශ්‍ය අය වෙනුවෙන් යාච්ඤා කරන්න.',
    meaningEn:'Pray for those who need the good news and for willing workers.',
    related:[['Luke 10:2','අස්වැන්නට සේවකයන් එවන ලෙස යාච්ඤා කරන්න.'],['John 4:35','අස්වැන්න සඳහා ඇස් ඔසවා බලන්න.']]
  },
  {
    ref:'Acts 13:47',
    si:'මම ඔබව ජාතීන්ට ආලෝකයක් ලෙස තැබුවෙමි.',
    en:'I have set thee to be a light of the Gentiles.',
    meaningSi:'දෙවියන්වහන්සේගේ ගැළවීමේ පණිවිඩය බෙදාගන්න.',
    meaningEn:'Share God’s message of salvation with people everywhere.',
    related:[['Isaiah 49:6','ජාතීන්ට ආලෝකයක් වීමේ කැඳවීම.'],['Matthew 28:19','සියලු ජාතීන් වෙත ගොස් ගෝලයන් කරන්න.']]
  },
  {
    ref:'Acts 1:8',
    si:'ශුද්ධාත්මයාණන් ඔබ කෙරෙහි පැමිණි විට ඔබට බලය ලැබේ.',
    en:'Ye shall receive power, after that the Holy Ghost is come upon you.',
    meaningSi:'ශුද්ධාත්මයාණන්ගේ උපකාරයෙන් යේසුස්වහන්සේ ගැන සාක්ෂි දරන්න.',
    meaningEn:'Witness for Jesus with the help of the Holy Spirit.',
    related:[['Matthew 28:19-20','ගෝලයන් කරන්න.'],['2 Timothy 1:8','ස්වාමීන් ගැන සාක්ෂි දැරීමට ලජ්ජා නොවන්න.']]
  },
  {
    ref:'Romans 10:14-15',
    si:'ඔවුන් අසා නැති තැනැන්වහන්සේ ගැන විශ්වාස කරන්නේ කෙසේද?',
    en:'How shall they believe in him of whom they have not heard?',
    meaningSi:'අන් අයට ශුභාරංචිය ඇසීමට එය බෙදාගන්නා අය අවශ්‍යය.',
    meaningEn:'People need to hear the good news.',
    related:[['Isaiah 52:7','සාමයේ ශුභාරංචිය ගෙන එන්නා.'],['Mark 16:15','මුළු ලෝකයටම ශුභාරංචිය දේශනා කරන්න.']]
  },
  {
    ref:'2 Timothy 4:2',
    si:'වචනය දේශනා කරන්න; සෑම විටම සූදානම්ව සිටින්න.',
    en:'Preach the word; be instant in season, out of season.',
    meaningSi:'දෙවියන්වහන්සේගේ වචනය ඉවසීමෙන් හා ප්‍රේමයෙන් බෙදාගන්න.',
    meaningEn:'Be ready to share God’s word with patience and love.',
    related:[['1 Peter 3:15','බලාපොරොත්තුව ගැන මෘදුකමින් පිළිතුරු දෙන්න.'],['Colossians 4:5-6','ප්‍රඥාවෙන් හැසිරෙමින් කරුණාවෙන් කතා කරන්න.']]
  },
  {
    ref:'Psalm 96:3',
    si:'ජාතීන් අතර උන්වහන්සේගේ මහිමය ප්‍රකාශ කරන්න.',
    en:'Declare his glory among the heathen, his wonders among all people.',
    meaningSi:'දෙවියන්වහන්සේගේ යහපත් ක්‍රියා අන් අය සමඟ බෙදාගන්න.',
    meaningEn:'Share God’s goodness and wonderful works with others.',
    related:[['Psalm 105:1','ස්වාමීන්වහන්සේගේ ක්‍රියා ප්‍රකාශ කරන්න.'],['Mark 5:19','ස්වාමීන් කළ දේ ගැන කියන්න.']]
  },
  {
    ref:'Matthew 5:14',
    si:'ඔබ ලෝකයේ ආලෝකයය.',
    en:'Ye are the light of the world.',
    meaningSi:'කරුණාව හා යහපත් ක්‍රියා තුළින් අන් අයට ආලෝකයක් වන්න.',
    meaningEn:'Be a light to others through kindness and good deeds.',
    related:[['Matthew 5:16','ඔබගේ ආලෝකය බැබළෙන්නට ඉඩ දෙන්න.'],['Philippians 2:15','ලෝකය තුළ ආලෝකයන් ලෙස බැබළෙන්න.']]
  },
  {
    ref:'Philippians 2:14-15',
    si:'සියල්ල මැසිවිලි හා විවාද නැතිව කරන්න.',
    en:'Do all things without murmurings and disputings.',
    meaningSi:'ස්තුතිවන්තකම හා සාමය තෝරාගෙන අන් අයට ආදර්ශයක් වන්න.',
    meaningEn:'Choose gratitude and peace instead of grumbling and arguments.',
    related:[['Colossians 3:23','සෑම දෙයක්ම හදවතින් කරන්න.'],['Ephesians 4:29','අන් අය ගොඩනඟන වචන කතා කරන්න.']]
  },
  {
    ref:'1 Peter 2:9',
    si:'ඔබ තෝරාගත් පරම්පරාවක්, රාජකීය පූජකත්වයක්, ශුද්ධ ජාතියක්ය.',
    en:'Ye are a chosen generation, a royal priesthood, an holy nation.',
    meaningSi:'දෙවියන්වහන්සේගේ යහපත්කම ඔබගේ ජීවිතයෙන් පෙන්වන්න.',
    meaningEn:'Let your life reflect God’s goodness.',
    related:[['Isaiah 43:21','දෙවියන්වහන්සේගේ ප්‍රශංසාව ප්‍රකාශ කරන්න.'],['Ephesians 5:8','ආලෝකයේ දරුවන් ලෙස ජීවත් වන්න.']]
  }];

// November 20–30 Verse List
const novemberList = document.getElementById('novemberList');

if (novemberList) {
  novemberList.innerHTML = novPlan.map((verse, index) => `
    <div class="related-item" style="margin-bottom:10px;">
      <strong>November ${index + 20} — ${verse.ref}</strong>
      <span>${verse.si}</span>
    </div>
 `).join('');
}

const dayStart = new Date(
  localDate.getFullYear(),
  localDate.getMonth(),
  localDate.getDate()
);

const dayIndex = Math.floor(dayStart.getTime() / 86400000) % verses.length;

const today = (
  localDate.getFullYear() === 2026 &&
  localDate.getMonth() === 10 &&
  november2026[localDate.getDate()] !== undefined
)
  ? novPlan[november2026[localDate.getDate()]]
  : verses[dayIndex];

document.getElementById('reference').textContent = today.ref;
document.getElementById('sinhala').textContent = '“' + today.si + '”';
document.getElementById('english').textContent = '“' + today.en + '”';
document.getElementById('meaningSi').textContent = today.meaningSi;
document.getElementById('meaningEn').textContent = today.meaningEn;

document.getElementById('related').innerHTML =
  today.related.map(([ref, desc]) =>
    `<div class="related-item"><strong>${ref}</strong><span>${desc}</span></div>`
  ).join('');

function toast(message) {
  const element = document.getElementById('toast');
  element.textContent = message;
  element.classList.add('show');
  setTimeout(() => element.classList.remove('show'), 2200);
}

function getFavorites() {
  return JSON.parse(localStorage.getItem('dailyword-favorites') || '[]');
}

function renderFavorites() {
  const favorites = getFavorites();
  const element = document.getElementById('favorites');

  if (!favorites.length) {
    element.innerHTML =
      '<div style="color:#768078;font-size:13px">No saved verses yet.</div>';
    return;
  }

  element.innerHTML = favorites.map(verse => `
    <div class="saved-entry">
      <span><strong>${verse.ref}</strong><br>${verse.si}</span>
      <button data-ref="${verse.ref}">Remove</button>
    </div>
  `).join('');

  element.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      const updated = getFavorites().filter(
        verse => verse.ref !== button.dataset.ref
      );
      localStorage.setItem('dailyword-favorites', JSON.stringify(updated));
      renderFavorites();
    });
  });
}

document.getElementById('save').addEventListener('click', () => {
  const favorites = getFavorites();

  if (favorites.some(verse => verse.ref === today.ref)) {
    toast('This verse is already saved');
    return;
  }

  favorites.unshift({
    ref: today.ref,
    si: today.si,
    en: today.en
  });

  localStorage.setItem('dailyword-favorites', JSON.stringify(favorites));
  renderFavorites();
  toast('Verse saved to favorites');
});

document.getElementById('share').addEventListener('click', async () => {
  const text =
    `Daily Word – ${today.ref}\n\n${today.si}\n\n${today.en}`;

  if (navigator.share) {
    try {
      await navigator.share({title:'Daily Word', text});
    } catch (error) {
      console.log('Share cancelled');
    }
  } else {
    try {
      await navigator.clipboard.writeText(text);
      toast('Verse copied to clipboard');
    } catch (error) {
      toast('Unable to share');
    }
  }
});
// Reflection saving with Firebase and local backup
const reflectionBox = document.getElementById('reflection');
const saveReflectionButton = document.getElementById('saveReflection');

reflectionBox.value =
  localStorage.getItem('dailyword-reflection-' + today.ref) || '';

let currentUser = null;

// Create a private anonymous user without showing a login screen
async function connectFirebase() {
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
  }, {merge:true});
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
// Load the saved reflection for today's verse
async function loadCurrentReflection() {
  try {
    const snapshot = await getReflectionFromFirebase(today.ref);

    if (snapshot.exists()) {
      const data = snapshot.data();
      reflectionBox.value = data.reflection || '';

      // Keep a local backup too
      localStorage.setItem(
        'dailyword-reflection-' + today.ref,
        reflectionBox.value
      );
    }
  } catch (error) {
    console.error('Could not load reflection:', error);
    toast('Using reflection saved on this device');
  }
}

// Show all previously saved reflections
async function loadReflectionHistory() {
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

    const reflectionsRef = collection(
      db,
      'users',
      user.uid,
      'reflections'
    );

    const historyQuery = query(
      reflectionsRef,
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(historyQuery);

    if (snapshot.empty) {
      historyElement.innerHTML +=
        '<p>No saved reflections yet.</p>';
      return;
    }

    snapshot.forEach(item => {
      const data = item.data();

      const entry = document.createElement('div');
      entry.style.padding = '12px';
      entry.style.margin = '8px 0';
      entry.style.border = '1px solid #ddd';
      entry.style.borderRadius = '8px';

      const heading = document.createElement('strong');
      heading.textContent = data.verseRef || 'Saved reflection';

      const paragraph = document.createElement('p');
      paragraph.textContent = data.reflection || '';

      entry.appendChild(heading);
      entry.appendChild(paragraph);
      historyElement.appendChild(entry);
    });

  } catch (error) {
    console.error('Could not load reflection history:', error);
    historyElement.innerHTML +=
      '<p>History could not be loaded. Please check your internet connection.</p>';
  }
}
// Save reflection locally and to Firebase
saveReflectionButton.addEventListener('click', async () => {
  const reflection = reflectionBox.value.trim();

  if (!reflection) {
    toast('Please write your reflection first');
    return;
  }

  // Save a local backup first
  localStorage.setItem(
    'dailyword-reflection-' + today.ref,
    reflection
  );

  saveReflectionButton.disabled = true;
  saveReflectionButton.textContent = 'Saving...';

  try {
    await saveReflectionToFirebase(today.ref, reflection);

    toast('Reflection saved to Firebase');
    await loadReflectionHistory();

  } catch (error) {
    console.error('Firebase save failed:', error);
    toast('Cloud save failed. Saved on this device only.');

  } finally {
    saveReflectionButton.disabled = false;
    saveReflectionButton.textContent = 'Save Reflection';
  }
});

// Start Firebase connection and load saved data
async function startReflectionFeatures() {
  try {
    await connectFirebase();
    await loadCurrentReflection();
    await loadReflectionHistory();

  } catch (error) {
    console.error('Firebase connection failed:', error);
    toast('Firebase connection failed');
  }
}

// Render saved favorite verses
renderFavorites();

// Start reflection features
startReflectionFeatures();
// Register the service worker for the Daily Word app
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .catch(error => {
        console.error('Service worker registration failed:', error);
      });
  });
}
