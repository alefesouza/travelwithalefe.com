import { FILE_DOMAIN, SITE_NAME } from '@/app/utils/constants';
import { serialize } from 'tinyduration';
import useHost from '@/app/hooks/use-host';
import getMetadata from '@/app/utils/get-metadata';
import useI18n from '@/app/hooks/use-i18n';

export default function SchemaData({
  media,
  isWebStories = false,
  isExpand = false,
  withOptional = false,
  includeVideoTags = false,
}) {
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');
  const i18n = useI18n();

  const { title, description, hashtags, locationDescription, embedVideo } =
    getMetadata(media, isBR);

  const content = (
    <>
      <span itemProp="name" content={title} />
      <span itemProp="description" content={description} />
      <span itemProp="creditText" content={i18n(SITE_NAME)} />
      <span itemProp="creator" itemScope itemType="http://schema.org/Person">
        <span itemProp="name" content="Alefe Souza"></span>
        <span itemProp="image" content={host('/profile-photo-2x.jpg')}></span>
      </span>
      <span
        itemProp="copyrightNotice"
        content={i18n(SITE_NAME) + ' - @viajarcomale'}
      />
      <span
        itemProp="uploadDate"
        content={
          media.date
            ? media.date.includes(',')
              ? new Date(media.date).toISOString() + '+00:00'
              : media.date.replace(' ', 'T') + '+03:00'
            : media.cityData && media.cityData.end + 'T12:00:00+03:00'
        }
      />
      <span
        itemProp="license"
        content="https://creativecommons.org/licenses/by-nc/4.0/"
      />
      <span itemProp="acquireLicensePage" content={host('/about')} />
      <span itemProp="genre" content="Travel" />

      {media.type !== '360photo' && (
        <>
          <span
            itemProp="width"
            content={
              isWebStories && media.type === 'youtube' ? 480 : media.width
            }
          ></span>
          <span
            itemProp="height"
            content={
              isWebStories && media.type === 'youtube' ? 360 : media.height
            }
          ></span>
        </>
      )}

      {media.file && media.file.includes('.mp4') && (
        <>
          <span
            itemProp="duration"
            content={serialize({ seconds: Math.ceil(media.duration) })}
          />
          <span
            itemProp="thumbnailUrl"
            content={FILE_DOMAIN + media.file.replace('.mp4', '-thumb.png')}
          />
        </>
      )}
      <span
        itemProp="contentLocation"
        itemScope
        itemType="https://schema.org/Place"
      >
        {locationDescription && (
          <span itemProp="name" content={locationDescription} />
        )}
        {(media.longitude || media.location_data?.[0]?.latitude) && (
          <span
            itemProp="geo"
            itemScope
            itemType="https://schema.org/GeoCoordinates"
          >
            {(media.altitude || media.location_data?.[0]?.altitude) && (
              <span
                itemProp="elevation"
                content={media.altitude || media.location_data[0].altitude}
              />
            )}
            {(media.latitude || media.location_data?.[0]?.latitude) && (
              <span
                itemProp="latitude"
                content={media.latitude || media.location_data[0].latitude}
              />
            )}
            {(media.latitude || media.location_data?.[0]?.latitude) && (
              <span
                itemProp="longitude"
                content={media.longitude || media.location_data[0].longitude}
              />
            )}
          </span>
        )}
        <span
          itemProp="address"
          itemScope
          itemType="https://schema.org/PostalAddress"
        >
          <span
            itemProp="addressLocality"
            content={
              media.cityData &&
              (isBR && media.cityData.name_pt
                ? media.cityData.name_pt
                : media.cityData.name)
            }
          />
          {media.countryData && (
            <span itemProp="addressCountry" content={media.countryData.iso} />
          )}
        </span>
      </span>
      {includeVideoTags && (
        <>
          <span itemProp="embedUrl" content={embedVideo} />
          <span
            itemProp="thumbnailUrl"
            content={
              media.type === 'youtube' ? media.image : FILE_DOMAIN + media.file
            }
          />
        </>
      )}
    </>
  );

  const optionalContent = (
    <>
      {hashtags && hashtags.length > 0 && (
        <span itemProp="keywords" content={'#' + hashtags.join(' #')} />
      )}
    </>
  );

  if (!isWebStories) {
    return (
      <>
        {((isExpand && media.img_index) || withOptional) && optionalContent}
        {content}
      </>
    );
  }

  return (
    <div>
      {media.file && media.file.includes('.mp4') && optionalContent}
      <span itemProp="contentUrl" content={FILE_DOMAIN + media.file} />
      {content}
    </div>
  );
}
