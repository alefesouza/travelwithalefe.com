import {
  FILE_DOMAIN,
  FILE_DOMAIN_11968,
  FILE_DOMAIN_8192,
} from '@/app/utils/constants';
import styles from './index.module.css';
import useI18n from '@/app/hooks/use-i18n';

export default async function Photo360({ media }) {
  const i18n = useI18n();

  return (
    <>
      <div className={styles.panorama}>
        <div
          id="panorama"
          data-photo={FILE_DOMAIN + media.photo}
          data-resize8192={FILE_DOMAIN_8192 + media.photo}
          data-resize11968={FILE_DOMAIN_11968 + media.photo}
          data-thumbnail={FILE_DOMAIN + media.file}
          data-yaw={media.yaw}
        ></div>

        <div style={{ display: 'none' }}>
          <canvas id="max-texture-size"></canvas>
        </div>

        <span
          itemProp="contentUrl"
          content={FILE_DOMAIN_11968 + media.photo}
        ></span>
        <span itemProp="thumbnailUrl" content={FILE_DOMAIN + media.file}></span>
        <span itemProp="width" content="11968"></span>
        <span itemProp="height" content="5984"></span>
      </div>

      <div className="center_link" style={{ marginBlock: 16 }}>
        <button id="load-full-quality">{i18n('Load Full Quality')}</button>
      </div>
    </>
  );
}
