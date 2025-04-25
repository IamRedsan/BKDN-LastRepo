"use client";

import { Language } from "@/enums/Language";
import type React from "react";

import { createContext, useContext, useState, useEffect } from "react";

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const translations = {
  en: {
    home: "Home",
    search: "Search",
    create: "Create",
    notifications: "Notifications",
    profile: "Profile",
    settings: "Settings",
    login: "Login",
    register: "Register",
    forgotPassword: "Forgot Password",
    changePassword: "Change Password",
    editProfile: "Edit Profile",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    language: "Language",
    logout: "Logout",
    post: "Post",
    comment: "Comment",
    like: "Like",
    repost: "Repost",
    share: "Share",
    delete: "Delete",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    username: "Username",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    bio: "Bio",
    displayName: "Display Name",
    website: "Website",
    avatar: "Avatar",
    translate: "Translate",
    viewEditHistory: "View Edit History",
    reportContent: "Report Content",
    followUser: "Follow",
    unfollowUser: "Unfollow",
    google: "Google",
    error: "Error",
    banned: "You are banned from this platform.",
    emailNotVerified:
      "Your email is not verified. \n We have sent a verification email to your registered email address. Please check your inbox and verify your email to access all features.",
    emailVerified: "Your email is verified.",
    emptyFields: "Please fill in all fields.",
    loading: "Loading...",
    loginFailed: "Login failed. Please check your credentials.",
    success: "Success",
    googleLoginSuccess: "Google login successful!",
    googleLoginFailed: "Google login failed or banned.",
    verifySuccess: "Email verification successful!",
    verifySuccessDescription:
      "Your email has been successfully verified. Your account is now active and you can start using all features.",
    ifNotRedirect:
      "You will be automatically redirected to the home page in a few seconds.",
    resendEmailSuccess: "Verification email resent successfully!",
    resendEmailFailed: "Failed to resend verification email.",
    name: "Name",
    registerFailed: "Account or email already exists or is invalid.",
    followers: "Followers",
    following: "Following",
    loading_image: "Loading image...",
    avatarUpdated: "Avatar updated successfully!",
    avatarUpdateFailed: "Failed to update avatar.",
    wallpaperUpdated: "Wallpaper updated successfully!",
    wallpaperUpdateFailed: "Failed to update wallpaper.",
    uploading: "Uploading...",
    uploadFailed: "Upload failed.",
    nameAndUsernameRequired: "Name and username are required fields.",
    profileUpdated: "Profile has been updated.",
    saving: "Saving...",
    settingUpdated: "Setting has been updated.",
    currentPassword: "Current Password",
    newPassword: "New Password",
    passwordChanged: "Password changed successfully!",
    passwordChangeFailed: "Failed to change password.",
    passwordNotSuitable: "Password does not meet the requirements.",
    passwordsDoNotMatch: "Passwords do not match.",
    passwordRequirements:
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    passwordMustMatch: "Password must match the confirmation password.",
    threadDetails: "Thread Details",
    public: "Public",
    followers_only: "Followers Only",
    only_me: "Only Me",
    select_privacy: "Select Privacy",
    post_empty: "Post content cannot be empty.",
    post_created: "Post created successfully!",
    post_create_failed: "Failed to create post.",
    post_updated: "Post updated successfully!",
    post_update_failed: "Failed to update post.",
    post_deleted: "Post deleted successfully!",
    post_delete_failed: "Failed to delete post.",
    no_comment_yet: "No comments yet.",
    comment_created: "Comment created successfully!",
    comment_create_failed: "Failed to create comment.",
  },
  vi: {
    home: "Trang chủ",
    search: "Tìm kiếm",
    create: "Tạo mới",
    notifications: "Thông báo",
    profile: "Hồ sơ",
    settings: "Cài đặt",
    login: "Đăng nhập",
    register: "Đăng ký",
    forgotPassword: "Quên mật khẩu",
    changePassword: "Đổi mật khẩu",
    editProfile: "Chỉnh sửa hồ sơ",
    darkMode: "Chế độ tối",
    lightMode: "Chế độ sáng",
    language: "Ngôn ngữ",
    logout: "Đăng xuất",
    post: "Đăng bài",
    comment: "Bình luận",
    like: "Thích",
    repost: "Chia sẻ lại",
    share: "Chia sẻ",
    delete: "Xóa",
    edit: "Chỉnh sửa",
    save: "Lưu",
    cancel: "Hủy",
    username: "Tên người dùng",
    email: "Email",
    password: "Mật khẩu",
    confirmPassword: "Xác nhận mật khẩu",
    bio: "Tiểu sử",
    displayName: "Tên hiển thị",
    website: "Trang web",
    avatar: "Ảnh đại diện",
    translate: "Dịch",
    viewEditHistory: "Xem lịch sử chỉnh sửa",
    reportContent: "Báo cáo nội dung",
    followUser: "Theo dõi",
    unfollowUser: "Bỏ theo dõi",
    google: "Google",
    error: "Lỗi",
    banned: "Bạn đã bị cấm khỏi nền tảng này.",
    emailNotVerified:
      "Email của bạn chưa được xác minh. \n Chúng tôi đã gửi một email xác minh đến địa chỉ email đã đăng ký của bạn. Vui lòng kiểm tra hộp thư đến của bạn và xác minh email của bạn để truy cập tất cả các tính năng.",
    emailVerified: "Email của bạn đã được xác minh.",
    emptyFields: "Vui lòng điền vào tất cả các trường.",
    loading: "Đang tải...",
    loginFailed:
      "Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập của bạn.",
    success: "Thành công",
    googleLoginSuccess: "Đăng nhập Google thành công!",
    googleLoginFailed: "Đăng nhập Google thất bại hoặc bị cấm.",
    verifySuccess: "Xác minh email thành công!",
    verifySuccessDescription:
      "Email của bạn đã được xác minh thành công. Tài khoản của bạn hiện đã hoạt động và bạn có thể bắt đầu sử dụng tất cả các tính năng.",
    ifNotRedirect:
      "Bạn sẽ được tự động chuyển hướng đến trang chủ trong vài giây.",
    resendEmailSuccess: "Gửi lại email xác minh thành công!",
    resendEmailFailed: "Gửi lại email xác minh thất bại.",
    name: "Tên",
    registerFailed: "Tài khoản hoặc email đã tồn tại hoặc không hợp lệ.",
    followers: "Người theo dõi",
    following: "Người đang theo dõi",
    loading_image: "Đang tải ảnh...",
    avatarUpdated: "Cập nhật ảnh đại diện thành công!",
    avatarUpdateFailed: "Cập nhật ảnh đại diện thất bại.",
    wallpaperUpdated: "Cập nhật hình nền thành công!",
    wallpaperUpdateFailed: "Cập nhật hình nền thất bại.",
    uploading: "Đang tải lên...",
    uploadFailed: "Tải lên thất bại.",
    nameAndUsernameRequired: "Tên và tên người dùng là các trường bắt buộc.",
    profileUpdated: "Thông tin cá nhân đã được cập nhật. ",
    saving: "Đang lưu...",
    settingUpdated: "Cài đặt đã được cập nhật.",
    currentPassword: "Mật khẩu hiện tại",
    newPassword: "Mật khẩu mới",
    passwordChanged: "Đổi mật khẩu thành công!",
    passwordChangeFailed: "Đổi mật khẩu thất bại.",
    passwordNotSuitable: "Mật khẩu không đáp ứng yêu cầu.",
    passwordsDoNotMatch: "Mật khẩu không khớp.",
    passwordRequirements:
      "Mật khẩu phải chứa ít nhất một chữ cái viết hoa, một chữ cái viết thường, một số và một ký tự đặc biệt.",
    passwordMustMatch: "Mật khẩu phải khớp với mật khẩu xác nhận.",
    threadDetails: "Chi tiết bài viết",
    public: "Công khai",
    followers_only: "Chỉ người theo dõi",
    only_me: "Chỉ mình tôi",
    select_privacy: "Chọn quyền riêng tư",
    post_empty: "Nội dung bài viết không được để trống.",
    post_created: "Bài viết đã được tạo thành công!",
    post_create_failed: "Tạo bài viết thất bại.",
    post_updated: "Bài viết đã được cập nhật thành công!",
    post_update_failed: "Cập nhật bài viết thất bại.",
    post_deleted: "Bài viết đã được xóa thành công!",
    post_delete_failed: "Xóa bài viết thất bại.",
    no_comment_yet: "Chưa có bình luận nào.",
    comment_created: "Bình luận đã được tạo thành công!",
    comment_create_failed: "Tạo bình luận thất bại.",
  },
  ja: {
    home: "ホーム",
    search: "検索",
    create: "作成",
    notifications: "通知",
    profile: "プロフィール",
    settings: "設定",
    login: "ログイン",
    register: "登録",
    forgotPassword: "パスワードをお忘れですか",
    changePassword: "パスワード変更",
    editProfile: "プロフィール編集",
    darkMode: "ダークモード",
    lightMode: "ライトモード",
    language: "言語",
    logout: "ログアウト",
    post: "投稿",
    comment: "コメント",
    like: "いいね",
    repost: "リポスト",
    share: "シェア",
    delete: "削除",
    edit: "編集",
    save: "保存",
    cancel: "キャンセル",
    username: "ユーザー名",
    email: "メール",
    password: "パスワード",
    confirmPassword: "パスワード確認",
    bio: "自己紹介",
    displayName: "表示名",
    website: "ウェブサイト",
    avatar: "アバター",
    translate: "翻訳",
    viewEditHistory: "編集履歴を見る",
    reportContent: "コンテンツを報告",
    followUser: "フォロー",
    unfollowUser: "フォロー解除",
    google: "グーグル",
    error: "エラー",
    banned: "このプラットフォームから禁止されています。",
    emailNotVerified:
      "メールが確認されていません。 \n 登録したメールアドレスに確認メールを送信しました。受信トレイを確認し、すべての機能にアクセスするためにメールを確認してください。",
    emailVerified: "メールが確認されました。",
    emptyFields: "すべてのフィールドに入力してください。",
    loading: "読み込み中...",
    loginFailed: "ログインに失敗しました。資格情報を確認してください。",
    success: "成功",
    googleLoginSuccess: "Googleログインに成功しました!",
    googleLoginFailed: "Googleログインに失敗したか、禁止されています。",
    verifySuccess: "メール確認に成功しました!",
    verifySuccessDescription:
      "メールが正常に確認されました。アカウントは現在アクティブで、すべての機能を使用できます。",
    ifNotRedirect: "数秒後に自動的にホームページにリダイレクトされます。",
    resendEmailSuccess: "確認メールの再送信に成功しました!",
    resendEmailFailed: "確認メールの再送信に失敗しました。",
    name: "名前",
    registerFailed: "アカウントまたはメールが存在するか、無効です。",
    followers: "フォロワー",
    following: "フォロー中",
    loading_image: "画像を読み込み中...",
    avatarUpdated: "アバターが正常に更新されました!",
    avatarUpdateFailed: "アバターの更新に失敗しました。",
    wallpaperUpdated: "壁紙が正常に更新されました!",
    wallpaperUpdateFailed: "壁紙の更新に失敗しました。",
    uploading: "アップロード中...",
    uploadFailed: "アップロードに失敗しました。",
    nameAndUsernameRequired: "名前とユーザー名は必須フィールドです。",
    profileUpdated: "プロフィールが更新されました。",
    saving: "保存中...",
    settingUpdated: "設定が更新されました。",
    currentPassword: "現在のパスワード",
    newPassword: "新しいパスワード",
    passwordChanged: "パスワードが正常に変更されました!",
    passwordChangeFailed: "パスワードの変更に失敗しました。",
    passwordNotSuitable: "パスワードが要件を満たしていません。",
    passwordsDoNotMatch: "パスワードが一致しません。",
    passwordRequirements:
      "パスワードには、少なくとも1つの大文字、1つの小文字、1つの数字、および1つの特殊文字を含める必要があります。",
    passwordMustMatch: "パスワードは確認用パスワードと一致する必要があります。",
    threadDetails: "スレッドの詳細",
    public: "公開",
    followers_only: "フォロワーのみ",
    only_me: "自分だけ",
    select_privacy: "プライバシーを選択",
    post_empty: "投稿内容は空にできません。",
    post_created: "投稿が正常に作成されました!",
    post_create_failed: "投稿の作成に失敗しました。",
    post_updated: "投稿が正常に更新されました!",
    post_update_failed: "投稿の更新に失敗しました。",
    post_deleted: "投稿が正常に削除されました!",
    post_delete_failed: "投稿の削除に失敗しました。",
    no_comment_yet: "まだコメントはありません。",
    comment_created: "コメントが正常に作成されました!",
    comment_create_failed: "コメントの作成に失敗しました。",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(Language.English);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage && ["en", "vi", "ja"].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key: string) => {
    return (
      translations[language][key as keyof (typeof translations)["en"]] || key
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
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
