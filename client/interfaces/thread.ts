import { Status, Visibility } from "@/enums/ThreadEnum";

export interface IMedia {
  url: string; // URL của ảnh hoặc video
  type: "image" | "video"; // Loại media: 'image' hoặc 'video'
  thumbnail?: string; // Ảnh preview cho video
}

export interface IThread {
  _id: string; // ObjectId của thread
  user: {
    username: string; // Tên người dùng
    name: string; // Tên hiển thị của người dùng
    avatar: string; // URL của ảnh đại diện người dùng
  }; // ObjectId của người dùng, có thể là string trong FE
  parentThreadId?: string | null; // ObjectId của thread cha, có thể là null
  content: string; // Nội dung của thread
  status: Status; // Trạng thái của thread (public, private, friend only)
  visibility: Visibility; // Quyền riêng tư của thread (public, private, friend only)
  reactionNum: number; // Số lượt phản ứng
  sharedNum: number; // Số lần chia sẻ
  commentNum: number; // Số bình luận
  isLiked: boolean; // Trạng thái đã thích hay chưa
  isReThreaded: boolean; // Trạng thái đã re-thread hay chưa
  reactionBy: string[]; // Mảng các ObjectId người dùng đã phản ứng
  reThreadBy: string[]; // Mảng các ObjectId người dùng đã re-thread
  media: IMedia[]; // Mảng media liên quan đến thread (ảnh/video)
  createdAt: Date; // Ngày tạo thread
  updatedAt: Date; // Ngày cập nhật thread
}
