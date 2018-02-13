export interface SongMetadata {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: any;
    channelTitle: string;
    tags: [
      string
      ],
    categoryId: string;
    liveBroadcastContent: string;
    defaultLanguage: string;
    localized: {
      title: string;
      description: string
    },
    defaultAudioLanguage: string
  };
  contentDetails: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean,
    regionRestriction: {
      allowed: [
        string
        ],
      blocked: [
        string
        ]
    },
    projection: string;
    hasCustomThumbnail: boolean
  };
}
