export interface CitizenQuote {
  id: number;
  quote: string;
  author: string;
  category: 'pembebasan' | 'pergerakan' | 'sastra' | 'komunitas';
}

export const CITIZEN_QUOTES: CitizenQuote[] = [
  // ── I. API PEMBEBASAN & NALAR KRITIS ──
  {
    id: 1,
    quote: 'Kalian boleh maju dalam pelajaran, mungkin mencapai deretan gelar, tapi tanpa mencintai sastra, kalian hanya hewan yang pandai.',
    author: 'Pramoedya Ananta Toer',
    category: 'pembebasan',
  },
  {
    id: 2,
    quote: 'Tahu kau mengapa aku sayangi kau lebih dari siapa pun? Karena kau menulis. Suaramu takkan padam ditelan angin, akan abadi sampai jauh di kemudian hari.',
    author: 'Pramoedya Ananta Toer',
    category: 'pembebasan',
  },
  {
    id: 3,
    quote: 'Berterimakasihlah pada segala yang memberi kehidupan, rawatlah buku seperti kau merawat akal budimu.',
    author: 'Pramoedya Ananta Toer',
    category: 'pembebasan',
  },
  {
    id: 4,
    quote: 'Seorang terpelajar harus sudah berbuat adil sejak dalam pikiran, apalagi dalam perbuatan.',
    author: 'Pramoedya Ananta Toer',
    category: 'pembebasan',
  },
  {
    id: 5,
    quote: 'Membaca adalah jembatan menuju kedaulatan pikiran; orang yang tak membaca mudah dijadikan budak orang lain.',
    author: 'Pramoedya Ananta Toer',
    category: 'pembebasan',
  },
  {
    id: 6,
    quote: 'Tujuan pendidikan itu untuk mempertajam kecerdasan, memperkukuh kemauan, serta memperhalus perasaan.',
    author: 'Tan Malaka',
    category: 'pembebasan',
  },
  {
    id: 7,
    quote: 'Ingatlah! Bahwa dari dalam kubur, suara saya akan lebih keras daripada dari atas bumi.',
    author: 'Tan Malaka',
    category: 'pembebasan',
  },
  {
    id: 8,
    quote: 'Idealisme adalah kemewahan terakhir yang hanya dimiliki oleh pemuda.',
    author: 'Tan Malaka',
    category: 'pembebasan',
  },
  {
    id: 9,
    quote: 'Bila kaum muda yang telah belajar menganggap dirinya terlalu tinggi untuk membaur dengan rakyat yang bekerja dengan cangkul, lebih baik pendidikan itu tidak diberikan sama sekali.',
    author: 'Tan Malaka',
    category: 'pembebasan',
  },
  {
    id: 10,
    quote: 'Belajarlah dari barat, tapi jangan jadi peniru barat. Jadilah murid dari Timur yang merdeka.',
    author: 'Tan Malaka',
    category: 'pembebasan',
  },
  {
    id: 11,
    quote: 'Membaca kata adalah membaca dunia.',
    author: 'Paulo Freire',
    category: 'pembebasan',
  },
  {
    id: 12,
    quote: 'Pendidikan tidak mengubah dunia. Pendidikan mengubah orang. Oranglah yang akan mengubah dunia.',
    author: 'Paulo Freire',
    category: 'pembebasan',
  },
  {
    id: 13,
    quote: 'Hanya orang yang tak pernah membaca yang percaya bahwa dunia ini sudah selesai dan tak bisa diubah.',
    author: 'Paulo Freire',
    category: 'pembebasan',
  },
  {
    id: 14,
    quote: 'Ketika kaum tertindas mulai membaca dan berpikir, rantai pembodohan mulai berkarat dan patah.',
    author: 'Paulo Freire',
    category: 'pembebasan',
  },
  {
    id: 15,
    quote: 'Buku adalah senjata paling berbahaya bagi penguasa yang lalim.',
    author: 'George Orwell',
    category: 'pembebasan',
  },
  {
    id: 16,
    quote: 'Dalam masa tipu daya universal, mengatakan kebenaran lewat tulisan adalah tindakan revolusioner.',
    author: 'George Orwell',
    category: 'pembebasan',
  },
  {
    id: 17,
    quote: 'Buku-buku terbaik adalah buku yang menceritakan apa yang sudah kau ketahui tapi tak berani kau ucapkan.',
    author: 'George Orwell',
    category: 'pembebasan',
  },
  {
    id: 18,
    quote: 'Jika Anda tidak menyukai apa yang sedang dibicarakan dunia, ambil buku dan mulailah percakapan yang baru.',
    author: 'Tirto Adhi Soerjo',
    category: 'pembebasan',
  },
  {
    id: 19,
    quote: 'Buku adalah pelita bagi mereka yang menolak meraba-raba dalam kegelapan feodalisme.',
    author: 'Tirto Adhi Soerjo',
    category: 'pembebasan',
  },
  {
    id: 20,
    quote: 'Membaca adalah melatih keberanian untuk tidak seragam dengan orang banyak.',
    author: 'Sutan Sjahrir',
    category: 'pembebasan',
  },
  {
    id: 21,
    quote: 'Hidup yang tidak dipertaruhkan tidak akan pernah dimenangkan.',
    author: 'Sutan Sjahrir',
    category: 'pembebasan',
  },
  {
    id: 22,
    quote: 'Hanya ada dua pilihan: menjadi apatis dan tunduk, atau membaca dan ikut bergerak.',
    author: 'Sutan Sjahrir',
    category: 'pembebasan',
  },
  {
    id: 23,
    quote: 'Buku membuka mata batin bahwa kekuasaan tanpa kritik adalah bencana kemanusiaan.',
    author: 'Mohammad Hatta',
    category: 'pembebasan',
  },
  {
    id: 24,
    quote: 'Aku rela dipenjara asalkan bersama buku, karena dengan buku aku bebas.',
    author: 'Mohammad Hatta',
    category: 'pembebasan',
  },
  {
    id: 25,
    quote: 'Kurang cerdas dapat diperbaiki dengan belajar, kurang cakap dapat dihilangkan dengan pengalaman. Namun tidak jujur itu sulit diperbaiki.',
    author: 'Mohammad Hatta',
    category: 'pembebasan',
  },

  // ── II. PERLAWANAN, AKSI BERGERAK & KEDAULATAN RAKYAT ──
  {
    id: 26,
    quote: 'Lebih baik diasingkan daripada menyerah pada kemunafikan.',
    author: 'Soe Hok Gie',
    category: 'pergerakan',
  },
  {
    id: 27,
    quote: 'Kita tidak pernah menanamkan sesuatu, kita hanya mengunyah kebohongan dari generasi ke generasi jika berhenti membaca.',
    author: 'Soe Hok Gie',
    category: 'pergerakan',
  },
  {
    id: 28,
    quote: 'Guru yang tak membaca buku adalah lilin yang membakar dirinya sendiri tanpa memberi terang.',
    author: 'Soe Hok Gie',
    category: 'pergerakan',
  },
  {
    id: 29,
    quote: 'Nasib terbaik adalah tidak pernah dilahirkan, kedua dilahirkan tapi mati muda, dan tersial adalah berumur panjang tapi tumpul pikiran.',
    author: 'Soe Hok Gie',
    category: 'pergerakan',
  },
  {
    id: 30,
    quote: 'Apabila usul ditolak tanpa ditimbang, suara dibungkam, kritik dilarang tanpa alasan: hanya ada satu kata, lawan!',
    author: 'Wiji Thukul',
    category: 'pergerakan',
  },
  {
    id: 31,
    quote: 'Puisi bukan sekadar rima, ia adalah batu karang di hadapan tirani.',
    author: 'Wiji Thukul',
    category: 'pergerakan',
  },
  {
    id: 32,
    quote: 'Jika kau menghalangi kami membaca dan berbicara, kami akan menulis di tembok-tembok jalanan.',
    author: 'Wiji Thukul',
    category: 'pergerakan',
  },
  {
    id: 33,
    quote: 'Kita harus terus membaca agar tidak pikun di hadapan janji-janji palsu.',
    author: 'Munir Said Thalib',
    category: 'pergerakan',
  },
  {
    id: 34,
    quote: 'Membaca adalah hak asasi paling purba; melarang orang berpengetahuan adalah kejahatan.',
    author: 'Munir Said Thalib',
    category: 'pergerakan',
  },
  {
    id: 35,
    quote: 'Membangun peradaban bukan dengan membagikan bantuan, tetapi dengan membebaskan akal sehat rakyat.',
    author: 'Munir Said Thalib',
    category: 'pergerakan',
  },
  {
    id: 36,
    quote: 'Pendidikan adalah senjata paling ampuh yang bisa kau gunakan untuk mengubah dunia.',
    author: 'Nelson Mandela',
    category: 'pergerakan',
  },
  {
    id: 37,
    quote: 'Membaca adalah sayap bagi jiwa yang terkurung di balik jeruji kemiskinan.',
    author: 'Nelson Mandela',
    category: 'pergerakan',
  },
  {
    id: 38,
    quote: 'Orang yang tidak membaca buku bagus tidak memiliki keunggulan dibanding orang yang tidak bisa membaca.',
    author: 'Mark Twain',
    category: 'pergerakan',
  },
  {
    id: 39,
    quote: 'Jauhi orang yang mencoba meremehkan ambisimu membaca. Orang kerdil selalu melakukan itu.',
    author: 'Mark Twain',
    category: 'pergerakan',
  },
  {
    id: 40,
    quote: 'Buku memberi kita tempat untuk pergi saat kita harus tetap berada di tempat kita sekarang.',
    author: 'Mason Cooley',
    category: 'pergerakan',
  },
  {
    id: 41,
    quote: 'Jika kau membaca buku yang dibaca orang lain, kau hanya bisa memikirkan apa yang dipikirkan orang lain.',
    author: 'Haruki Murakami',
    category: 'pergerakan',
  },
  {
    id: 42,
    quote: 'Membaca adalah pembangkangan sunyi terhadap kedangkalan zaman.',
    author: 'Haruki Murakami',
    category: 'pergerakan',
  },
  {
    id: 43,
    quote: 'Tidak ada perahu yang membawa kita berlayar sejauh sebuah buku.',
    author: 'Emily Dickinson',
    category: 'pergerakan',
  },
  {
    id: 44,
    quote: 'Buku adalah pembawa peradaban. Tanpa buku, sejarah diam, sastra bisu, sains lumpuh.',
    author: 'Barbara Tuchman',
    category: 'pergerakan',
  },
  {
    id: 45,
    quote: 'Literasi jalanan adalah bukti bahwa kebijaksanaan tidak tinggal di gedung-gedung berpagar tinggi.',
    author: 'Samin Surosentiko',
    category: 'pergerakan',
  },
  {
    id: 46,
    quote: 'Wong Samin ora nyolong, ora ngapusi, lan ora wedi marang bebener. (Orang merdeka tidak mencuri, tidak berbohong, dan tidak takut pada kebenaran).',
    author: 'Ajaran Samin Blora',
    category: 'pergerakan',
  },
  {
    id: 47,
    quote: 'Tanah ini dihidupi oleh orang-orang yang jujur budi dan gemar bertukar kawruh.',
    author: 'Kolektif Samin Blora',
    category: 'pergerakan',
  },
  {
    id: 48,
    quote: 'Jangan biarkan bangku sekolah menjadi satu-satunya tempatmu mencari tahu tentang semesta.',
    author: 'Ki Hadjar Dewantara',
    category: 'pergerakan',
  },
  {
    id: 49,
    quote: 'Setiap orang menjadi guru, setiap rumah dan jalanan menjadi sekolah.',
    author: 'Ki Hadjar Dewantara',
    category: 'pergerakan',
  },
  {
    id: 50,
    quote: 'Lawan tirani dengan aksara, robohkan kemalasan dengan membaca.',
    author: 'Tirto Adhi Soerjo',
    category: 'pergerakan',
  },

  // ── III. SASTRA, KETAJAMAN BAHASA & JIWA MERDEKA ──
  {
    id: 51,
    quote: 'Aku mau hidup seribu tahun lagi, lewat kata-kata yang tak pernah mati.',
    author: 'Chairil Anwar',
    category: 'sastra',
  },
  {
    id: 52,
    quote: 'Kami cuma tulang-tulang berserakan, tapi adalah kepunyaanmu; kaulah lagi yang tentukan nilai tulang-tulang berserakan.',
    author: 'Chairil Anwar',
    category: 'sastra',
  },
  {
    id: 53,
    quote: 'Mampus kau dikoyak-koyak sepi, jika hari-harimu lewat tanpa membaca lembaran aksara.',
    author: 'Chairil Anwar (Gubahan)',
    category: 'sastra',
  },
  {
    id: 54,
    quote: 'Hujan Bulan Juni mengajarkan kita: ketabahan terbaik adalah membaca sunyi tanpa banyak mengeluh.',
    author: 'Sapardi Djoko Damono',
    category: 'sastra',
  },
  {
    id: 55,
    quote: 'Yang fana adalah waktu. Kita abadi memungut ilmu dari halaman demi halaman.',
    author: 'Sapardi Djoko Damono',
    category: 'sastra',
  },
  {
    id: 56,
    quote: 'Ketika kata-kata tak lagi bermakna, sebuah buku membukakan pintu ke dunia yang lebih jujur.',
    author: 'Sapardi Djoko Damono',
    category: 'sastra',
  },
  {
    id: 57,
    quote: 'Ketika jurnalisme dibungkam, sastra harus bicara.',
    author: 'Seno Gumira Ajidarma',
    category: 'sastra',
  },
  {
    id: 58,
    quote: 'Membaca fiksi bukan lari dari kenyataan, melainkan menyelami kenyataan yang paling dalam.',
    author: 'Seno Gumira Ajidarma',
    category: 'sastra',
  },
  {
    id: 59,
    quote: 'Buku di trotoar adalah perlawanan terhadap kota yang semakin rakus pada uang.',
    author: 'Seno Gumira Ajidarma',
    category: 'sastra',
  },
  {
    id: 60,
    quote: 'Buku adalah kapak untuk memecahkan laut beku di dalam diri kita.',
    author: 'Franz Kafka',
    category: 'sastra',
  },
  {
    id: 61,
    quote: 'Tidurlah dengan sebuah buku di sampingmu, kau akan bangun dengan mimpi yang lebih merdeka.',
    author: 'Franz Kafka',
    category: 'sastra',
  },
  {
    id: 62,
    quote: 'Bukan kegilaan yang menakutkan, melainkan ketidakmampuan manusia membaca tanda-tanda zaman.',
    author: 'Franz Kafka',
    category: 'sastra',
  },
  {
    id: 63,
    quote: 'Aku selalu membayangkan bahwa surga adalah sejenis perpustakaan.',
    author: 'Jorge Luis Borges',
    category: 'sastra',
  },
  {
    id: 64,
    quote: 'Ada kejahatan yang lebih buruk daripada membakar buku. Salah satunya adalah tidak membacanya.',
    author: 'Ray Bradbury',
    category: 'sastra',
  },
  {
    id: 65,
    quote: 'Kau tidak perlu membakar buku untuk menghancurkan budaya. Cukup buat orang berhenti membacanya.',
    author: 'Ray Bradbury',
    category: 'sastra',
  },
  {
    id: 66,
    quote: 'Membaca adalah mengembara ke pikiran orang lain tanpa harus meninggalkan tempat dudukmu.',
    author: 'Virginia Woolf',
    category: 'sastra',
  },
  {
    id: 67,
    quote: 'Kunci semua pintu kebebasan berpikir adalah ruang untuk membaca tanpa diganggu doktrin.',
    author: 'Virginia Woolf',
    category: 'sastra',
  },
  {
    id: 68,
    quote: 'Membaca membuat kita tidak merasa sendirian di tengah kerumunan yang asing.',
    author: 'C.S. Lewis',
    category: 'sastra',
  },
  {
    id: 69,
    quote: 'Kita membaca agar kita tahu bahwa kita tidak sendirian.',
    author: 'C.S. Lewis',
    category: 'sastra',
  },
  {
    id: 70,
    quote: 'Di tengah musim dingin yang menusuk, akhirnya aku tahu bahwa di dalam diriku ada musim panas yang tak terkalahkan.',
    author: 'Albert Camus',
    category: 'sastra',
  },
  {
    id: 71,
    quote: 'Satu-satunya cara menghadapi dunia yang tak bebas adalah menjadi begitu bebas hingga keberadaanmu adalah bentuk perlawanan.',
    author: 'Albert Camus',
    category: 'sastra',
  },
  {
    id: 72,
    quote: 'Buku adalah ruang perjumpaan di mana pembaca dan penulis saling menyembuhkan luka dunia.',
    author: 'Albert Camus',
    category: 'sastra',
  },
  {
    id: 73,
    quote: 'Buku yang tidak membuatmu terganggu bukanlah buku yang layak dibaca sampai habis.',
    author: 'Mochtar Lubis',
    category: 'sastra',
  },
  {
    id: 74,
    quote: 'Menjadi manusia adalah berani berkata benar, dan membaca adalah bahan bakar keberanian itu.',
    author: 'Mochtar Lubis',
    category: 'sastra',
  },
  {
    id: 75,
    quote: 'Kejahatan terbesar terhadap kemanusiaan adalah membiarkan anak-anak tumbuh tanpa mencintai bacaan.',
    author: 'R.A. Kartini',
    category: 'sastra',
  },

  // ── IV. SOLIDARITAS JALANAN, AKAR RUMPUT & BERBAHAGIA ──
  {
    id: 76,
    quote: 'Habis gelap terbitlah terang, habis membaca terbitlah fajar pemikiran.',
    author: 'R.A. Kartini',
    category: 'komunitas',
  },
  {
    id: 77,
    quote: 'Perpustakaan jalanan bukan sekadar buku di atas terpal; ia adalah ruang di mana rakyat menemukan martabatnya.',
    author: 'Relawan Kolektif Jalanan',
    category: 'komunitas',
  },
  {
    id: 78,
    quote: 'Buku adalah milik bersama, trotoar adalah panggung merdeka kita.',
    author: 'Kolektif Literasi Jalanan',
    category: 'komunitas',
  },
  {
    id: 79,
    quote: 'Membaca dan Berbahagia: karena orang yang bahagia dalam pengetahuannya tak bisa diperbudak ketakutan.',
    author: 'Perpusjal Blora',
    category: 'komunitas',
  },
  {
    id: 80,
    quote: 'Di atas terpal sederhana, semua kasta lebur di hadapan lembaran ilmu.',
    author: 'Perpusjal Blora',
    category: 'komunitas',
  },
  {
    id: 81,
    quote: 'Jangan biarkan kota hanya dipenuhi baliho politisi; penuhilah trotoar dengan buku dan percakapan hangat warga.',
    author: 'Perpusjal Blora',
    category: 'komunitas',
  },
  {
    id: 82,
    quote: 'Bukan gelar di atas ijazah yang menentukan nilai seorang warga, melainkan seberapa jujur ia merawat akal sehat sesama.',
    author: 'Perpusjal Blora',
    category: 'komunitas',
  },
  {
    id: 83,
    quote: 'Lapak baca adalah pesta demokrasi paling murni tanpa kotak suara dan tanpa dusta.',
    author: 'Perpusjal Blora',
    category: 'komunitas',
  },
  {
    id: 84,
    quote: 'Membaca buku di jalanan adalah manifesto bahwa ruang publik adalah kepunyaan rakyat, bukan pemodal.',
    author: 'Perpusjal Blora',
    category: 'komunitas',
  },
  {
    id: 85,
    quote: 'Gelar terhormat bukan warisan darah bangsawan, melainkan buah dari kesetiaan membaca dan bergotong royong.',
    author: 'Perpusjal Blora',
    category: 'komunitas',
  },
  {
    id: 86,
    quote: 'Buku adalah tiket perjalanan kelas utama yang bisa dinikmati oleh orang paling melarat sekalipun.',
    author: 'Malcolm X',
    category: 'komunitas',
  },
  {
    id: 87,
    quote: 'Orang yang tidak tahu sejarahnya seperti pohon yang tidak tahu akarnya; bacalah agar kau berakar kokoh.',
    author: 'Malcolm X',
    category: 'komunitas',
  },
  {
    id: 88,
    quote: 'Pendidikan adalah paspor untuk masa depan, hari esok milik orang-orang yang mempersiapkannya hari ini.',
    author: 'Malcolm X',
    category: 'komunitas',
  },
  {
    id: 89,
    quote: 'Kemampuan membaca telah membebaskan saya dari cengkeraman ketidaktahuan.',
    author: 'Frederick Douglass',
    category: 'komunitas',
  },
  {
    id: 90,
    quote: 'Begitu kau belajar membaca, kau akan selamanya merdeka.',
    author: 'Frederick Douglass',
    category: 'komunitas',
  },
  {
    id: 91,
    quote: 'Sains tanpa agama lumpuh, agama tanpa ilmu buta, manusia tanpa buku merana.',
    author: 'Albert Einstein',
    category: 'komunitas',
  },
  {
    id: 92,
    quote: 'Imajinasi lebih penting daripada pengetahuan, dan membaca adalah pintu gerbang menuju imajinasi liar.',
    author: 'Albert Einstein',
    category: 'komunitas',
  },
  {
    id: 93,
    quote: 'Hanya ada satu kebaikan, yaitu pengetahuan, dan satu kejahatan, yaitu kebodohan.',
    author: 'Socrates',
    category: 'komunitas',
  },
  {
    id: 94,
    quote: 'Buku adalah cermin: jika yang melihat adalah kekosongan, jangan harap menemukan kedalaman.',
    author: 'Kolektif Literasi Jalanan',
    category: 'komunitas',
  },
  {
    id: 95,
    quote: 'Membaca satu buku tidak langsung membuatmu pintar, tetapi membiasakan diri membaca membuatmu tidak mudah dibodohi.',
    author: 'Najwa Shihab',
    category: 'komunitas',
  },
  {
    id: 96,
    quote: 'Hanya dengan membaca kita bisa menjelajah ke mana pun, menjadi siapa pun, dan memahami apa pun.',
    author: 'Najwa Shihab',
    category: 'komunitas',
  },
  {
    id: 97,
    quote: 'Cuma perlu satu buku untuk jatuh cinta pada membaca. Temukan buku itu di atas terpal jalanan.',
    author: 'Najwa Shihab',
    category: 'komunitas',
  },
  {
    id: 98,
    quote: 'Bila kau ingin mengubah nasibmu, mulailah dengan membuka halaman pertama buku yang kau takuti.',
    author: 'James Baldwin',
    category: 'komunitas',
  },
  {
    id: 99,
    quote: 'Membaca menyelamatkanku dari keputusasaan bahwa dunia ini hanya dihuni oleh ketidakadilan.',
    author: 'James Baldwin',
    category: 'komunitas',
  },
  {
    id: 100,
    quote: 'Di hadapan buku yang terbuka, semua manusia berdiri setara di bawah langit semesta.',
    author: 'Kolektif Literasi Jalanan Blora',
    category: 'komunitas',
  },
];

/**
 * Returns a random quote from the collection.
 */
export function getRandomQuote(): CitizenQuote {
  const index = Math.floor(Math.random() * CITIZEN_QUOTES.length);
  return CITIZEN_QUOTES[index];
}

/**
 * Deterministically pick an initial quote based on username
 */
export function getQuoteByUsername(username: string): CitizenQuote {
  if (!username) return CITIZEN_QUOTES[0];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CITIZEN_QUOTES.length;
  return CITIZEN_QUOTES[index];
}
