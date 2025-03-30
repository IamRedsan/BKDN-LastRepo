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
