#!/usr/bin/env node
/**
 * Generates locale files from English base + locale overrides.
 * Run: node scripts/generate-locales.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const messagesDir = join(__dirname, '../packages/i18n/messages');
const en = JSON.parse(readFileSync(join(messagesDir, 'en.json'), 'utf8'));

function deepMerge(base, overrides) {
  const result = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && typeof base[key] === 'object') {
      result[key] = deepMerge(base[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

const locales = {
  tr: {
    meta: { title: 'EnteleWALLET Lite | EnteleKRON Ekosistemi için Güvenli Cüzdan Paneli', description: 'EnteleWALLET Lite ile EnteleKRON ekosistem cüzdanınızı bağlayın, doğrulayın ve izleyin.' },
    nav: { home: 'Ana Sayfa', connect: 'Bağlan', overview: 'Genel Bakış', assets: 'Varlıklar', transactions: 'İşlemler', vesting: 'Hakediş', claims: 'Talepler', security: 'Güvenlik', transparency: 'Şeffaflık', settings: 'Ayarlar', account: 'Hesap', support: 'Destek', roadmap: 'Yol Haritası', legal: 'Yasal' },
    common: { connectWallet: 'Cüzdan Bağla', disconnect: 'Bağlantıyı Kes', verifyOwnership: 'Sahipliği Doğrula', copyAddress: 'Adresi Kopyala', copied: 'Kopyalandı', viewExplorer: 'Explorer\'da Görüntüle', loading: 'Yükleniyor…', error: 'Hata', retry: 'Tekrar Dene', learnMore: 'Daha Fazla Bilgi', contactSupport: 'Destek ile İletişim', pendingConfiguration: 'Resmi yapılandırma bekleniyor', pendingVerification: 'Resmi doğrulama bekleniyor', integrationPending: 'Entegrasyon bekleniyor', noWalletConnected: 'Bağlı cüzdan yok', connectToView: 'Bu sayfayı görüntülemek için cüzdanınızı bağlayın', goToConnect: 'Bağlan\'a Git', createAccount: 'Hesap Oluştur', signIn: 'Giriş Yap', linkInvestorAccount: 'Yatırımcı Hesabını Bağla', openInvestorApp: 'EnteleKRON Yatırımcı Uygulamasını Aç', viewSecurityCenter: 'Güvenlik Merkezini Görüntüle', openTransparencyCenter: 'Şeffaflık Merkezini Aç', confirm: 'Onayla', cancel: 'İptal', save: 'Kaydet', back: 'Geri', language: 'Dil' },
    warnings: { liteNotice: 'EnteleWALLET Lite mevcut cüzdanınıza bağlanır. Seed phrase, özel anahtar veya fon saklamaz.', signatureNotice: 'Cüzdan doğrulama imzaları yalnızca cüzdan sahipliğini kanıtlar. Transfer, harcama onayı, ödeme veya blockchain işlemi yetkilendirmez.', maliciousSignature: 'Harcama onayı isteyen veya işlem yetkilendirmediğini açıkça belirtmeyen bir imza isteği EnteleWALLET doğrulama isteği değildir — imzalamayın.', domainCheck: 'Cüzdan bağlamadan önce her zaman resmi alan adlarını doğrulayın.', seedPhrase: 'EnteleWALLET, EnteleKRON, TVK Group, TVK Labs, SOVRA, destek personeli, ortaklar ve moderatörler asla seed phrase, özel anahtar veya kurtarma ifadesi istemez.' },
    home: { heroTitle: 'EnteleWALLET Lite', heroHeadline: 'EnteleKRON ekosistem cüzdanınızı bağlayın, doğrulayın ve izleyin.', heroSubtitle: 'ENK, SOVRA, EnergieMIND ve gelecekteki TVK Group ekosistem varlıkları için güvenli bir cüzdan bağlantılı panel.', featureWalletVerification: 'Cüzdan doğrulama', featureAssetMonitoring: 'Ekosistem varlık izleme', featureVestingClaims: 'Hakediş ve talep hazırlığı', featureAddressVerification: 'Resmi adres doğrulama', featureSecurityFirst: 'Güvenlik odaklı cüzdan erişimi', featureRoadmap: 'Gelecek tam cüzdan yol haritası', roadmapBlock: 'Tam EnteleWALLET gelecekteki bir non-custodial cüzdan aşaması olacaktır ve özel anahtar özellikleri uygulanmadan önce güvenlik mimarisi, bağımsız denetimler ve yasal inceleme gerektirir.' },
    connect: { title: 'Cüzdan Bağla', description: 'Mevcut cüzdanınızı bağlayın ve sahipliği güvenle doğrulayın.', connectedAddress: 'Bağlı Adres', network: 'Ağ', verificationStatus: 'Doğrulama Durumu', verifyPrompt: 'Güvenli bir SIWE imzası ile cüzdan sahipliğinizi doğrulayın. Gas ücreti yok. İşlem yok.', verifying: 'İmza bekleniyor…', verified: 'Cüzdan başarıyla doğrulandı', verificationFailed: 'Doğrulama başarısız. Lütfen tekrar deneyin.', wrongNetwork: 'Lütfen desteklenen bir ağa geçin', unsupportedNetwork: 'Bu ağ desteklenmiyor', walletConnectMissing: 'WalletConnect yapılandırılmamış.', walletConnectDevWarning: 'WalletConnect Project ID eksik.', notLinked: 'Bu cüzdan doğrulandı ancak henüz bir EnteleWALLET veya EnteleKRON hesabına bağlanmadı.' },
    overview: { title: 'Cüzdan Genel Bakış', description: 'Bağlı cüzdan paneliniz ve ekosistem durumu.', address: 'Adres', network: 'Ağ', verification: 'Doğrulama', primaryWallet: 'Birincil Cüzdan', enkBalance: 'ENK Bakiyesi', ecosystemAssets: 'Ekosistem Varlıkları', vestingStatus: 'Hakediş Durumu', claimStatus: 'Talep Durumu', notVerified: 'Doğrulanmadı', notLinked: 'Bağlı yatırımcı hesabı yok' },
    assets: { title: 'Varlıklar', description: 'Ekosistem token bakiyelerinizi görüntüleyin.', balance: 'Bakiye', network: 'Ağ', contract: 'Kontrat', symbol: 'Sembol', failedToLoad: 'Bakiye yüklenemedi', nativeAsset: 'Yerel varlık', futureAsset: 'Gelecek TVK ekosistem varlığı' },
    transactions: { title: 'İşlemler', description: 'İşlem geçmişi ve explorer bağlantıları.', indexingFuture: 'Detaylı işlem indeksleme gelecek sürümde eklenecektir.', walletExplorer: 'Cüzdan Explorer', tokenExplorer: 'ENK Token Explorer', emptyState: 'Henüz gösterilecek işlem yok.' },
    vesting: { title: 'Hakediş', description: 'ENK hakediş programınızı ve kilit açma durumunu görüntüleyin.', notLinked: 'Hakediş detaylarını görüntülemek için doğrulanmış EnteleKRON yatırımcı hesabınızı bağlayın.', learnAboutVesting: 'Hakediş hakkında bilgi edinin', allocationCategory: 'Tahsis Kategorisi', totalAllocated: 'Toplam Tahsis Edilen ENK', unlocked: 'Kilit Açılmış ENK', locked: 'Kilitli ENK', claimable: 'Talep Edilebilir ENK', cliff: 'Cliff', vestingStart: 'Hakediş Başlangıcı', nextUnlock: 'Sonraki Kilit Açma', schedule: 'Program' },
    claims: { title: 'Talepler', description: 'Token talep hazırlığı ve gereksinimleri.', notOpen: 'Token talepleri henüz açık değil.', requirementsTitle: 'Talep Gereksinimleri', reqVerifiedWallet: 'Doğrulanmış cüzdan', reqInvestorAccount: 'Onaylı yatırımcı hesabı', reqKyc: 'Gerekirse tamamlanmış KYC/AML', reqAllocation: 'Tahsis onayı', reqClaimContract: 'Resmi talep kontratı aktif', reqClaimPeriod: 'Talep dönemi aktif' },
    security: { title: 'Güvenlik Merkezi', description: 'Güvenlik rehberi, resmi alan adları ve oltalama koruması.', officialDomains: 'Resmi Alan Adları', redirectDomains: 'Yönlendirme Alan Adları', seedPhraseWarning: 'Seed Phrase ve Özel Anahtar Uyarısı', signatureSafety: 'İmza Güvenliği', signatureSafetyDetail: 'EnteleWALLET Lite imzaları yalnızca cüzdan sahipliğini doğrular. Fon transferi, harcama onayı veya gas maliyeti oluşturmaz.', walletConnectSafety: 'WalletConnect Güvenliği', walletConnectDetail: 'Yalnızca resmi EnteleWALLET uygulaması üzerinden bağlanın.', supportedWallets: 'Desteklenen Cüzdanlar', phishingProtection: 'Oltalama Koruması', addressVerification: 'Resmi Adres Doğrulama', reportConcern: 'Güvenlik Endişesi Bildir', futureRoadmap: 'Gelecek Güvenlik Yol Haritası' },
    transparency: { title: 'Şeffaflık Merkezi', description: 'Resmi EnteleKRON ve EnteleWALLET şeffaflık bilgileri.', externalLink: 'EnteleKRON\'da tam Şeffaflık Merkezini görüntüle', enkContract: 'ENK Kontratı', treasurySafe: 'Hazine Safe', presaleSafe: 'Ön Satış Safe', liquiditySafe: 'Likidite Safe', vestingSafe: 'Hakediş Safe', ecosystemReserveSafe: 'Ekosistem Rezerv Safe', governanceSafe: 'Yönetişim Safe' },
    settings: { title: 'Ayarlar', description: 'Bağlı cüzdanları ve doğrulama ayarlarını yönetin.', connectedWallets: 'Bağlı Cüzdanlar', verifiedWallets: 'Doğrulanmış Cüzdanlar', setPrimary: 'Birincil Olarak Ayarla', unlinkWallet: 'Cüzdan Bağlantısını Kes', unlinkConfirm: 'Bu cüzdanın bağlantısını kesmek istediğinizden emin misiniz?', lastVerified: 'Son Doğrulama', verificationHistory: 'Doğrulama Geçmişi', securityWarnings: 'Güvenlik Uyarıları' },
    account: { title: 'Hesap', description: 'EnteleWALLET hesabınızı ve bağlı cüzdanları yönetin.', guest: 'Misafir', connectedWallet: 'Bağlı Cüzdan', verifiedWallet: 'Doğrulanmış Cüzdan', accountCreated: 'Hesap Oluşturuldu', accountLinked: 'Hesap Bağlandı', investorLinked: 'Yatırımcı Bağlandı', partnerLinked: 'Ortak Bağlandı', linkedWallets: 'Bağlı Cüzdanlar', noAccount: 'Henüz bağlı hesap yok' },
    support: { title: 'Destek', description: 'Güvenlik endişelerini bildirin veya yardım alın.', reportPhishing: 'Oltalama Bildir', reportFakeDomain: 'Sahte Alan Adı Bildir', reportSuspiciousSignature: 'Şüpheli İmza İsteği Bildir', reportFakeSupport: 'Sahte Destek İletişimi Bildir', generalSupport: 'Genel Destek Talebi', securityEmail: 'Güvenlik İletişimi', supportEmail: 'Destek İletişimi', formSubject: 'Konu', formMessage: 'Mesaj', formEmail: 'E-posta Adresiniz', formSeverity: 'Önem Derecesi', formSubmit: 'Rapor Gönder', formSuccess: 'Rapor başarıyla gönderildi', formFallback: 'Doğrudan e-posta gönderin' },
    roadmap: { title: 'Yol Haritası', description: 'EnteleWALLET geliştirme aşamaları ve gelecek özellikler.', activeNow: 'Şu An Aktif', activeWalletConnect: 'Cüzdan bağlantısı', activeVerification: 'Cüzdan doğrulama', activeAssets: 'Varlık izleme', activeTransparency: 'Şeffaflık bağlantıları', activeSecurity: 'Güvenlik merkezi', nextPhase: 'Sonraki', nextInvestorLinking: 'Yatırımcı hesabı bağlama', nextVesting: 'Hakediş entegrasyonu', nextClaims: 'Talep hazırlığı', nextTransactions: 'İşlem indeksleme', futurePhase: 'Yalnızca Gelecek', futureCreateImport: 'Cüzdan oluşturma/içe aktarma', futureKeyStorage: 'Şifreli yerel anahtar depolama', futureMobile: 'Mobil uygulama', futureExtension: 'Tarayıcı eklentisi', futureWalletConnectMode: 'WalletConnect cüzdan modu', futureSmartAccounts: 'Akıllı hesaplar', futureRecovery: 'Kurtarma', futureSimulation: 'İşlem simülasyonu', futureAudits: 'Denetimler', futureBugBounty: 'Bug bounty', futureNotice: 'Gelecek aşama — EnteleWALLET Lite\'da aktif değil.' },
    legal: { title: 'Yasal ve Risk Bildirimi', description: 'EnteleWALLET Lite hakkında önemli yasal bilgiler.', disclaimer: 'EnteleWALLET Lite bir cüzdan bağlantı ve doğrulama arayüzüdür. Fon saklamaz, seed phrase depolamaz, yatırım tavsiyesi vermez, yasal veya vergi tavsiyesi vermez ve token değeri, likidite, listeleme veya getiri garantisi vermez.', noCustody: 'Saklama Yok', noCustodyDetail: 'EnteleWALLET Lite fonlarınızı asla tutmaz veya kontrol etmez.', noFinancialAdvice: 'Finansal Tavsiye Yok', noFinancialAdviceDetail: 'Bu uygulamadaki hiçbir şey yatırım, yasal veya vergi tavsiyesi oluşturmaz.', noGuarantee: 'Garanti Yok', noGuaranteeDetail: 'Token değeri, likidite, listeleme ve getiriler garanti edilmez.', userResponsibility: 'Kullanıcı Sorumluluğu', userResponsibilityDetail: 'Cüzdanınızın ve özel anahtarlarınızın güvenliğinden siz sorumlusunuz.', cryptoRisk: 'Kripto Riski', cryptoRiskDetail: 'Kripto varlıklar toplam değer kaybı dahil önemli risk içerir.', jurisdiction: 'Yargı Kısıtlamaları', jurisdictionDetail: 'Erişim belirli yargı bölgelerinde kısıtlanabilir.', futureFeatures: 'Gelecek Özellikler', futureFeaturesDetail: 'Gelecek özellikler etkinleştirilmeden önce yasal ve güvenlik incelemesine tabidir.' },
    wallet: { status: { disconnected: 'Bağlı Değil', connectedUnverified: 'Bağlı — Doğrulanmadı', signaturePending: 'İmza Bekleniyor', verified: 'Doğrulandı', verificationFailed: 'Doğrulama Başarısız', wrongNetwork: 'Yanlış Ağ', unsupportedNetwork: 'Desteklenmeyen Ağ', linkedToAccount: 'Hesaba Bağlı', linkedToOtherAccount: 'Başka Hesaba Bağlı', revoked: 'İptal Edildi' } },
    footer: { copyright: '© TVK Group. Tüm hakları saklıdır.', security: 'Güvenlik', legal: 'Yasal', support: 'Destek' },
  },
};

// For remaining locales, use a translation function approach with locale-specific top-level overrides
// We'll generate from en with locale-specific string maps

const LOCALE_STRINGS = {
  de: 'German', fr: 'French', es: 'Spanish', it: 'Italian', pt: 'Portuguese',
  nl: 'Dutch', ar: 'Arabic', ru: 'Russian', zh: 'Chinese', ja: 'Japanese',
  ko: 'Korean', hi: 'Hindi', ur: 'Urdu', id: 'Indonesian', ms: 'Malay',
  fa: 'Persian', el: 'Greek', bg: 'Bulgarian', ro: 'Romanian', pl: 'Polish',
  uk: 'Ukrainian', az: 'Azerbaijani', ka: 'Georgian',
};

// Generate remaining locales with translated common strings
const COMMON_TRANSLATIONS = {
  de: { connectWallet: 'Wallet verbinden', disconnect: 'Trennen', verifyOwnership: 'Eigentum verifizieren', loading: 'Laden…', language: 'Sprache', home: 'Startseite', connect: 'Verbinden', overview: 'Übersicht', assets: 'Vermögenswerte', transactions: 'Transaktionen', vesting: 'Vesting', claims: 'Ansprüche', security: 'Sicherheit', transparency: 'Transparenz', settings: 'Einstellungen', account: 'Konto', support: 'Support', roadmap: 'Roadmap', legal: 'Rechtliches' },
  fr: { connectWallet: 'Connecter le portefeuille', disconnect: 'Déconnecter', verifyOwnership: 'Vérifier la propriété', loading: 'Chargement…', language: 'Langue', home: 'Accueil', connect: 'Connecter', overview: 'Aperçu', assets: 'Actifs', transactions: 'Transactions', vesting: 'Vesting', claims: 'Réclamations', security: 'Sécurité', transparency: 'Transparence', settings: 'Paramètres', account: 'Compte', support: 'Support', roadmap: 'Feuille de route', legal: 'Mentions légales' },
  es: { connectWallet: 'Conectar billetera', disconnect: 'Desconectar', verifyOwnership: 'Verificar propiedad', loading: 'Cargando…', language: 'Idioma', home: 'Inicio', connect: 'Conectar', overview: 'Resumen', assets: 'Activos', transactions: 'Transacciones', vesting: 'Vesting', claims: 'Reclamaciones', security: 'Seguridad', transparency: 'Transparencia', settings: 'Configuración', account: 'Cuenta', support: 'Soporte', roadmap: 'Hoja de ruta', legal: 'Legal' },
  it: { connectWallet: 'Connetti wallet', disconnect: 'Disconnetti', verifyOwnership: 'Verifica proprietà', loading: 'Caricamento…', language: 'Lingua', home: 'Home', connect: 'Connetti', overview: 'Panoramica', assets: 'Asset', transactions: 'Transazioni', vesting: 'Vesting', claims: 'Reclami', security: 'Sicurezza', transparency: 'Trasparenza', settings: 'Impostazioni', account: 'Account', support: 'Supporto', roadmap: 'Roadmap', legal: 'Legale' },
  pt: { connectWallet: 'Conectar carteira', disconnect: 'Desconectar', verifyOwnership: 'Verificar propriedade', loading: 'Carregando…', language: 'Idioma', home: 'Início', connect: 'Conectar', overview: 'Visão geral', assets: 'Ativos', transactions: 'Transações', vesting: 'Vesting', claims: 'Reivindicações', security: 'Segurança', transparency: 'Transparência', settings: 'Configurações', account: 'Conta', support: 'Suporte', roadmap: 'Roteiro', legal: 'Legal' },
  nl: { connectWallet: 'Wallet verbinden', disconnect: 'Verbreken', verifyOwnership: 'Eigendom verifiëren', loading: 'Laden…', language: 'Taal', home: 'Home', connect: 'Verbinden', overview: 'Overzicht', assets: 'Activa', transactions: 'Transacties', vesting: 'Vesting', claims: 'Claims', security: 'Beveiliging', transparency: 'Transparantie', settings: 'Instellingen', account: 'Account', support: 'Ondersteuning', roadmap: 'Roadmap', legal: 'Juridisch' },
  ar: { connectWallet: 'ربط المحفظة', disconnect: 'قطع الاتصال', verifyOwnership: 'التحقق من الملكية', loading: 'جاري التحميل…', language: 'اللغة', home: 'الرئيسية', connect: 'اتصال', overview: 'نظرة عامة', assets: 'الأصول', transactions: 'المعاملات', vesting: 'الاستحقاق', claims: 'المطالبات', security: 'الأمان', transparency: 'الشفافية', settings: 'الإعدادات', account: 'الحساب', support: 'الدعم', roadmap: 'خارطة الطريق', legal: 'قانوني' },
  ru: { connectWallet: 'Подключить кошелёк', disconnect: 'Отключить', verifyOwnership: 'Подтвердить владение', loading: 'Загрузка…', language: 'Язык', home: 'Главная', connect: 'Подключить', overview: 'Обзор', assets: 'Активы', transactions: 'Транзакции', vesting: 'Вестинг', claims: 'Получение', security: 'Безопасность', transparency: 'Прозрачность', settings: 'Настройки', account: 'Аккаунт', support: 'Поддержка', roadmap: 'Дорожная карта', legal: 'Правовая информация' },
  zh: { connectWallet: '连接钱包', disconnect: '断开连接', verifyOwnership: '验证所有权', loading: '加载中…', language: '语言', home: '首页', connect: '连接', overview: '概览', assets: '资产', transactions: '交易', vesting: '归属', claims: '领取', security: '安全', transparency: '透明度', settings: '设置', account: '账户', support: '支持', roadmap: '路线图', legal: '法律' },
  ja: { connectWallet: 'ウォレットを接続', disconnect: '切断', verifyOwnership: '所有権を確認', loading: '読み込み中…', language: '言語', home: 'ホーム', connect: '接続', overview: '概要', assets: '資産', transactions: '取引', vesting: 'ベスティング', claims: 'クレーム', security: 'セキュリティ', transparency: '透明性', settings: '設定', account: 'アカウント', support: 'サポート', roadmap: 'ロードマップ', legal: '法的情報' },
  ko: { connectWallet: '지갑 연결', disconnect: '연결 해제', verifyOwnership: '소유권 확인', loading: '로딩 중…', language: '언어', home: '홈', connect: '연결', overview: '개요', assets: '자산', transactions: '거래', vesting: '베스팅', claims: '청구', security: '보안', transparency: '투명성', settings: '설정', account: '계정', support: '지원', roadmap: '로드맵', legal: '법적 고지' },
  hi: { connectWallet: 'वॉलेट कनेक्ट करें', disconnect: 'डिस्कनेक्ट', verifyOwnership: 'स्वामित्व सत्यापित करें', loading: 'लोड हो रहा है…', language: 'भाषा', home: 'होम', connect: 'कनेक्ट', overview: 'अवलोकन', assets: 'संपत्ति', transactions: 'लेनदेन', vesting: 'वेस्टिंग', claims: 'दावे', security: 'सुरक्षा', transparency: 'पारदर्शिता', settings: 'सेटिंग्स', account: 'खाता', support: 'सहायता', roadmap: 'रोडमैप', legal: 'कानूनी' },
  ur: { connectWallet: 'والیٹ منسلک کریں', disconnect: 'منقطع', verifyOwnership: 'ملکیت کی تصدیق', loading: 'لوڈ ہو رہا ہے…', language: 'زبان', home: 'ہوم', connect: 'منسلک', overview: 'جائزہ', assets: 'اثاثے', transactions: 'لین دین', vesting: 'وesting', claims: 'دعوے', security: 'سیکیورٹی', transparency: 'شفافیت', settings: 'ترتیبات', account: 'اکاؤنٹ', support: 'مدد', roadmap: 'روڈ میپ', legal: 'قانونی' },
  id: { connectWallet: 'Hubungkan Dompet', disconnect: 'Putuskan', verifyOwnership: 'Verifikasi Kepemilikan', loading: 'Memuat…', language: 'Bahasa', home: 'Beranda', connect: 'Hubungkan', overview: 'Ikhtisar', assets: 'Aset', transactions: 'Transaksi', vesting: 'Vesting', claims: 'Klaim', security: 'Keamanan', transparency: 'Transparansi', settings: 'Pengaturan', account: 'Akun', support: 'Dukungan', roadmap: 'Peta Jalan', legal: 'Hukum' },
  ms: { connectWallet: 'Sambung Dompet', disconnect: 'Putuskan', verifyOwnership: 'Sahkan Pemilikan', loading: 'Memuatkan…', language: 'Bahasa', home: 'Laman Utama', connect: 'Sambung', overview: 'Gambaran Keseluruhan', assets: 'Aset', transactions: 'Transaksi', vesting: 'Vesting', claims: 'Tuntutan', security: 'Keselamatan', transparency: 'Ketelusan', settings: 'Tetapan', account: 'Akaun', support: 'Sokongan', roadmap: 'Peta Jalan', legal: 'Undang-undang' },
  fa: { connectWallet: 'اتصال کیف پول', disconnect: 'قطع اتصال', verifyOwnership: 'تأیید مالکیت', loading: 'در حال بارگذاری…', language: 'زبان', home: 'خانه', connect: 'اتصال', overview: 'نمای کلی', assets: 'دارایی‌ها', transactions: 'تراکنش‌ها', vesting: 'وesting', claims: 'مطالبات', security: 'امنیت', transparency: 'شفافیت', settings: 'تنظیمات', account: 'حساب', support: 'پشتیبانی', roadmap: 'نقشه راه', legal: 'قانونی' },
  el: { connectWallet: 'Σύνδεση πορτοφολιού', disconnect: 'Αποσύνδεση', verifyOwnership: 'Επαλήθευση ιδιοκτησίας', loading: 'Φόρτωση…', language: 'Γλώσσα', home: 'Αρχική', connect: 'Σύνδεση', overview: 'Επισκόπηση', assets: 'Περιουσιακά', transactions: 'Συναλλαγές', vesting: 'Vesting', claims: 'Αξιώσεις', security: 'Ασφάλεια', transparency: 'Διαφάνεια', settings: 'Ρυθμίσεις', account: 'Λογαριασμός', support: 'Υποστήριξη', roadmap: 'Οδικός χάρτης', legal: 'Νομικά' },
  bg: { connectWallet: 'Свържи портфейл', disconnect: 'Прекъсни', verifyOwnership: 'Потвърди собственост', loading: 'Зареждане…', language: 'Език', home: 'Начало', connect: 'Свържи', overview: 'Преглед', assets: 'Активи', transactions: 'Транзакции', vesting: 'Vesting', claims: 'Искания', security: 'Сигурност', transparency: 'Прозрачност', settings: 'Настройки', account: 'Акаунт', support: 'Поддръжка', roadmap: 'Пътна карта', legal: 'Правни' },
  ro: { connectWallet: 'Conectează portofelul', disconnect: 'Deconectează', verifyOwnership: 'Verifică proprietatea', loading: 'Se încarcă…', language: 'Limbă', home: 'Acasă', connect: 'Conectează', overview: 'Prezentare generală', assets: 'Active', transactions: 'Tranzacții', vesting: 'Vesting', claims: 'Revendicări', security: 'Securitate', transparency: 'Transparență', settings: 'Setări', account: 'Cont', support: 'Suport', roadmap: 'Foaie de parcurs', legal: 'Legal' },
  pl: { connectWallet: 'Połącz portfel', disconnect: 'Rozłącz', verifyOwnership: 'Zweryfikuj własność', loading: 'Ładowanie…', language: 'Język', home: 'Strona główna', connect: 'Połącz', overview: 'Przegląd', assets: 'Aktywa', transactions: 'Transakcje', vesting: 'Vesting', claims: 'Roszczenia', security: 'Bezpieczeństwo', transparency: 'Przejrzystość', settings: 'Ustawienia', account: 'Konto', support: 'Wsparcie', roadmap: 'Mapa drogowa', legal: 'Prawne' },
  uk: { connectWallet: 'Підключити гаманець', disconnect: 'Відключити', verifyOwnership: 'Підтвердити власність', loading: 'Завантаження…', language: 'Мова', home: 'Головна', connect: 'Підключити', overview: 'Огляд', assets: 'Активи', transactions: 'Транзакції', vesting: 'Vesting', claims: 'Отримання', security: 'Безпека', transparency: 'Прозорість', settings: 'Налаштування', account: 'Обліковий запис', support: 'Підтримка', roadmap: 'Дорожня карта', legal: 'Правова інформація' },
  az: { connectWallet: 'Cüzdanı qoş', disconnect: 'Ayır', verifyOwnership: 'Mülkiyyəti təsdiqlə', loading: 'Yüklənir…', language: 'Dil', home: 'Ana səhifə', connect: 'Qoş', overview: 'İcmal', assets: 'Aktivlər', transactions: 'Əməliyyatlar', vesting: 'Vesting', claims: 'Tələblər', security: 'Təhlükəsizlik', transparency: 'Şəffaflıq', settings: 'Parametrlər', account: 'Hesab', support: 'Dəstək', roadmap: 'Yol xəritəsi', legal: 'Hüquqi' },
  ka: { connectWallet: 'საფულის დაკავშირება', disconnect: 'გათიშვა', verifyOwnership: 'მფლობელობის დადასტურება', loading: 'იტვირთება…', language: 'ენა', home: 'მთავარი', connect: 'დაკავშირება', overview: 'მიმოხილვა', assets: 'აქტივები', transactions: 'ტრanzakcie', vesting: 'Vesting', claims: 'მოთხოვნები', security: 'უსაფრთხოება', transparency: 'გ transparency', settings: 'პარამეტრები', account: 'ანგარიში', support: 'მხარდაჭერა', roadmap: 'გეგმა', legal: 'იურიდიული' },
};

function applyCommonTranslations(locale, base) {
  const t = COMMON_TRANSLATIONS[locale];
  if (!t) return base;
  const result = JSON.parse(JSON.stringify(base));
  if (t.connectWallet) result.common.connectWallet = t.connectWallet;
  if (t.disconnect) result.common.disconnect = t.disconnect;
  if (t.verifyOwnership) result.common.verifyOwnership = t.verifyOwnership;
  if (t.loading) result.common.loading = t.loading;
  if (t.language) result.common.language = t.language;
  if (t.home) result.nav.home = t.home;
  if (t.connect) result.nav.connect = t.connect;
  if (t.overview) result.nav.overview = t.overview;
  if (t.assets) result.nav.assets = t.assets;
  if (t.transactions) result.nav.transactions = t.transactions;
  if (t.vesting) result.nav.vesting = t.vesting;
  if (t.claims) result.nav.claims = t.claims;
  if (t.security) result.nav.security = t.security;
  if (t.transparency) result.nav.transparency = t.transparency;
  if (t.settings) result.nav.settings = t.settings;
  if (t.account) result.nav.account = t.account;
  if (t.support) result.nav.support = t.support;
  if (t.roadmap) result.nav.roadmap = t.roadmap;
  if (t.legal) result.nav.legal = t.legal;
  // Translate key page titles
  result.connect.title = t.connect ? `${t.connect} Wallet` : result.connect.title;
  result.overview.title = t.overview || result.overview.title;
  result.assets.title = t.assets || result.assets.title;
  result.transactions.title = t.transactions || result.transactions.title;
  result.vesting.title = t.vesting || result.vesting.title;
  result.claims.title = t.claims || result.claims.title;
  result.security.title = t.security ? `${t.security} Center` : result.security.title;
  result.transparency.title = t.transparency ? `${t.transparency} Center` : result.transparency.title;
  result.settings.title = t.settings || result.settings.title;
  result.account.title = t.account || result.account.title;
  result.support.title = t.support || result.support.title;
  result.roadmap.title = t.roadmap || result.roadmap.title;
  result.legal.title = t.legal || result.legal.title;
  result.home.heroTitle = 'EnteleWALLET Lite';
  return result;
}

// Write Turkish with full overrides
for (const [locale, overrides] of Object.entries(locales)) {
  const merged = deepMerge(en, overrides);
  writeFileSync(join(messagesDir, `${locale}.json`), JSON.stringify(merged, null, 2) + '\n');
  console.log(`Generated ${locale}.json`);
}

// Write other locales with common translations applied
for (const locale of Object.keys(COMMON_TRANSLATIONS)) {
  const merged = applyCommonTranslations(locale, en);
  writeFileSync(join(messagesDir, `${locale}.json`), JSON.stringify(merged, null, 2) + '\n');
  console.log(`Generated ${locale}.json`);
}

console.log('All locale files generated.');
