import { MongooseModule } from '@nestjs/mongoose';
import { Schema } from 'mongoose';
import { IUrlAnalyticsDoc, IUrlDoc } from './url.interface';
import { USER_SCHEMA_NAME } from '../user/user.schema';

export const URL_SCHEMA_NAME = 'Url';
export const URL_COLLECTION_NAME = 'urls';

export const ANALYTICS_SCHEMA_NAME = 'Analytics';
export const ANALYTICS_COLLECTION_NAME = 'analytics';

export const UrlSchema = new Schema<IUrlDoc>(
  {
    originalURL: { type: String, required: true },
    urlCode: { type: String, required: true, unique: true },
    shortURL: { type: String, required: true, unique: true },
    clickCount: { type: Number, required: true, default: 0 },
    lastClickedAt: { type: Date, required: true, default: Date.now() },
    user: {
      type: Schema.Types.ObjectId,
      ref: USER_SCHEMA_NAME,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const UrlSchemaModule = MongooseModule.forFeature([
  {
    name: URL_SCHEMA_NAME,
    schema: UrlSchema,
    collection: URL_COLLECTION_NAME,
  },
]);

export const AnalyticSchema = new Schema<IUrlAnalyticsDoc>(
  {
    url: { type: Schema.Types.ObjectId, ref: URL_SCHEMA_NAME, required: true },
    referralSource: { type: String, required: false, default: 'direct' },
    browserType: { type: String, required: false, default: 'uknown' },
    deviceType: { type: String, required: false, default: 'others' },
  },
  { timestamps: true, versionKey: false },
);

export const AnalyticSchemaModule = MongooseModule.forFeature([
  {
    name: ANALYTICS_SCHEMA_NAME,
    schema: AnalyticSchema,
    collection: ANALYTICS_COLLECTION_NAME,
  },
]);
