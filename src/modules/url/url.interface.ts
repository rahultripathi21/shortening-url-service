import { Document, Schema } from 'mongoose';

export interface IUrlDoc extends Document {
  originalURL: string;
  urlCode: string;
  shortURL: string;
  clickCount: number;
  lastClickedAt: Date;
  user: Schema.Types.ObjectId;
  createdAt: string;
  updatedAt: string;
}

export interface IUrlInputs {
  urlCode: string;
  referralSource: string;
  browserType: string;
  deviceType: string;
}

export interface IUrlAnalyticsDoc extends Document {
  url: Schema.Types.ObjectId;
  referralSource: string;
  browserType: string;
  deviceType: string;
  createdAt: string;
  updatedAt: string;
}
