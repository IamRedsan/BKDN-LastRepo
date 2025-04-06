'use client';

import type React from 'react';

import { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'vi' | 'ja';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const translations = {
  en: {
    home: 'Home',
    search: 'Search',
    create: 'Create',
    notifications: 'Notifications',
    profile: 'Profile',
    settings: 'Settings',
    login: 'Login',
    register: 'Register',
    forgotPassword: 'Forgot Password',
    changePassword: 'Change Password',
    editProfile: 'Edit Profile',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'Language',
    logout: 'Logout',
    post: 'Post',
    comment: 'Comment',
    like: 'Like',
    repost: 'Repost',
    share: 'Share',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    bio: 'Bio',
    displayName: 'Display Name',
    website: 'Website',
    avatar: 'Avatar',
    translate: 'Translate',
    viewEditHistory: 'View Edit History',
    reportContent: 'Report Content',
    followUser: 'Follow',
    unfollowUser: 'Unfollow',
    google: 'Google',
    error: 'Error',
    banned: 'You are banned from this platform.',
    emailNotVerified:
      'Your email is not verified. \n We have sent a verification email to your registered email address. Please check your inbox and verify your email to access all features.',
    emailVerified: 'Your email is verified.',
    emptyFields: 'Please fill in all fields.',
    loading: 'Loading...',
    loginFailed: 'Login failed. Please check your credentials.',
    success: 'Success',
    googleLoginSuccess: 'Google login successful!',
    googleLoginFailed: 'Google login failed or banned.',
    verifySuccess: 'Email verification successful!',
    verifySuccessDescription:
      'Your email has been successfully verified. Your account is now active and you can start using all features.',
    ifNotRedirect:
      'You will be automatically redirected to the home page in a few seconds.',
    resendEmailSuccess: 'Verification email resent successfully!',
    resendEmailFailed: 'Failed to resend verification email.',
    name: 'Name',
    registerFailed: 'Account or email already exists or is invalid.',
  },
  vi: {
    home: 'Trang chủ',
    search: 'Tìm kiếm',
    create: 'Tạo mới',
    notifications: 'Thông báo',
    profile: 'Hồ sơ',
    settings: 'Cài đặt',
    login: 'Đăng nhập',
    register: 'Đăng ký',
    forgotPassword: 'Quên mật khẩu',
    changePassword: 'Đổi mật khẩu',
    editProfile: 'Chỉnh sửa hồ sơ',
    darkMode: 'Chế độ tối',
    lightMode: 'Chế độ sáng',
    language: 'Ngôn ngữ',
    logout: 'Đăng xuất',
    post: 'Đăng bài',
    comment: 'Bình luận',
    like: 'Thích',
    repost: 'Chia sẻ lại',
    share: 'Chia sẻ',
    delete: 'Xóa',
    edit: 'Chỉnh sửa',
    save: 'Lưu',
    cancel: 'Hủy',
    username: 'Tên người dùng',
    email: 'Email',
    password: 'Mật khẩu',
    confirmPassword: 'Xác nhận mật khẩu',
    bio: 'Tiểu sử',
    displayName: 'Tên hiển thị',
    website: 'Trang web',
    avatar: 'Ảnh đại diện',
    translate: 'Dịch',
    viewEditHistory: 'Xem lịch sử chỉnh sửa',
    reportContent: 'Báo cáo nội dung',
    followUser: 'Theo dõi',
    unfollowUser: 'Bỏ theo dõi',
    google: 'Google',
    error: 'Lỗi',
    banned: 'Bạn đã bị cấm khỏi nền tảng này.',
    emailNotVerified:
      'Email của bạn chưa được xác minh. \n Chúng tôi đã gửi một email xác minh đến địa chỉ email đã đăng ký của bạn. Vui lòng kiểm tra hộp thư đến của bạn và xác minh email của bạn để truy cập tất cả các tính năng.',
    emailVerified: 'Email của bạn đã được xác minh.',
    emptyFields: 'Vui lòng điền vào tất cả các trường.',
    loading: 'Đang tải...',
    loginFailed:
      'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập của bạn.',
    success: 'Thành công',
    googleLoginSuccess: 'Đăng nhập Google thành công!',
    googleLoginFailed: 'Đăng nhập Google thất bại hoặc bị cấm.',
    verifySuccess: 'Xác minh email thành công!',
    verifySuccessDescription:
      'Email của bạn đã được xác minh thành công. Tài khoản của bạn hiện đã hoạt động và bạn có thể bắt đầu sử dụng tất cả các tính năng.',
    ifNotRedirect:
      'Bạn sẽ được tự động chuyển hướng đến trang chủ trong vài giây.',
    resendEmailSuccess: 'Gửi lại email xác minh thành công!',
    resendEmailFailed: 'Gửi lại email xác minh thất bại.',
    name: 'Tên',
    registerFailed: 'Tài khoản hoặc email đã tồn tại hoặc không hợp lệ.',
  },
  ja: {
    home: 'ホーム',
    search: '検索',
    create: '作成',
    notifications: '通知',
    profile: 'プロフィール',
    settings: '設定',
    login: 'ログイン',
    register: '登録',
    forgotPassword: 'パスワードをお忘れですか',
    changePassword: 'パスワード変更',
    editProfile: 'プロフィール編集',
    darkMode: 'ダークモード',
    lightMode: 'ライトモード',
    language: '言語',
    logout: 'ログアウト',
    post: '投稿',
    comment: 'コメント',
    like: 'いいね',
    repost: 'リポスト',
    share: 'シェア',
    delete: '削除',
    edit: '編集',
    save: '保存',
    cancel: 'キャンセル',
    username: 'ユーザー名',
    email: 'メール',
    password: 'パスワード',
    confirmPassword: 'パスワード確認',
    bio: '自己紹介',
    displayName: '表示名',
    website: 'ウェブサイト',
    avatar: 'アバター',
    translate: '翻訳',
    viewEditHistory: '編集履歴を見る',
    reportContent: 'コンテンツを報告',
    followUser: 'フォロー',
    unfollowUser: 'フォロー解除',
    google: 'グーグル',
    error: 'エラー',
    banned: 'このプラットフォームから禁止されています。',
    emailNotVerified:
      'メールが確認されていません。 \n 登録したメールアドレスに確認メールを送信しました。受信トレイを確認し、すべての機能にアクセスするためにメールを確認してください。',
    emailVerified: 'メールが確認されました。',
    emptyFields: 'すべてのフィールドに入力してください。',
    loading: '読み込み中...',
    loginFailed: 'ログインに失敗しました。資格情報を確認してください。',
    success: '成功',
    googleLoginSuccess: 'Googleログインに成功しました!',
    googleLoginFailed: 'Googleログインに失敗したか、禁止されています。',
    verifySuccess: 'メール確認に成功しました!',
    verifySuccessDescription:
      'メールが正常に確認されました。アカウントは現在アクティブで、すべての機能を使用できます。',
    ifNotRedirect: '数秒後に自動的にホームページにリダイレクトされます。',
    resendEmailSuccess: '確認メールの再送信に成功しました!',
    resendEmailFailed: '確認メールの再送信に失敗しました。',
    name: '名前',
    registerFailed: 'アカウントまたはメールが存在するか、無効です。',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'vi', 'ja'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string) => {
    return (
      translations[language][key as keyof (typeof translations)['en']] || key
    );
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
