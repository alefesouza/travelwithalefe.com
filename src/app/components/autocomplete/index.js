'use client';

import Select, { components } from 'react-select';
import useI18nClient from '@/app/hooks/use-i18n-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useId } from 'react';
import { ITEMS_PER_PAGE } from '@/app/utils/constants';
import { shuffleArray } from '@/app/utils/media-sorting';

export default function Autocomplete() {
  const router = useRouter();
  const i18n = useI18nClient();

  const featuredHashtags = [
    i18n('#favorites'),
    i18n('#food'),
    i18n('#observationdeck'),
    i18n('#7wondersoftheworld'),
  ];
  const featuredOptions = featuredHashtags.map((item) => ({
    label: item,
    value: item,
  }));
  const [allOptions, setAllOptions] = useState(featuredOptions);
  const [allHashtags, setAllHashtags] = useState(featuredOptions);
  const [withLocationsChecked, setWithLocationsChecked] = useState(false);
  const [randomHashtags, setRandomHashtags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [wasShuffled, setWasShuffled] = useState(false);
  const defaultStyling = {
    control: (base, state) => ({
      ...base,
      border: state.isFocused ? '1px solid #2096cc' : '',
      boxShadow: state.isFocused ? '0px 0px 0px 1px #2096cc' : '',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#2096cc' : 'inherit',
      '&:hover': { backgroundColor: state.isSelected ? '#2096cc' : '#deebff' },
    }),
  };
  const [customStyle, setCustomStyles] = useState(defaultStyling);
  const [text, setText] = useState('');

  const updateRandomHashtags = (hashtags, fromClick = false) => {
    if (text.length) {
      setAllOptions(allHashtags);
      return;
    }

    const array = Array.from(Array(hashtags.length).keys());
    const randomArray = shuffleArray(array).slice(0, ITEMS_PER_PAGE);
    const randomHashtags = randomArray.map((i) => hashtags[i]);

    setRandomHashtags(randomHashtags);

    if (!fromClick && !wasShuffled) {
      setAllOptions([...featuredOptions, ...randomHashtags]);
      return;
    }

    setAllOptions(randomHashtags);
    setWasShuffled(true);
  };

  const updateHashtags = async (withLocations, shouldUpdateRandom) => {
    const today = new Date().toISOString().split('T')[0];
    const hashtagsUpdated = localStorage.getItem(
      'hashtags_updated' + (withLocations ? '_with_locations' : '')
    );

    if (hashtagsUpdated) {
      const hashtags = JSON.parse(
        localStorage.getItem(
          'hashtags' + (withLocations ? '_with_locations' : '')
        )
      ).map((h) => ({ label: '#' + h, value: '#' + h }));
      setAllHashtags(hashtags);

      if ((!randomHashtags.length || shouldUpdateRandom) && text.length === 0) {
        updateRandomHashtags(hashtags, shouldUpdateRandom);
      }

      if (shouldUpdateRandom && text.length > 0) {
        setAllOptions(hashtags);
      }
    }

    if (today === hashtagsUpdated) {
      return;
    }

    setIsLoading(true);

    const result = await fetch('/api/hashtags?with_locations=' + withLocations);
    const data = await result.text();

    const hashtags = JSON.parse(data).map((h) => ({
      label: '#' + h,
      value: '#' + h,
    }));

    if (withLocations) {
      setAllHashtags(hashtags);
    } else {
      setAllHashtags([...featuredOptions, ...hashtags]);
    }

    if (!hashtagsUpdated || withLocations) {
      updateRandomHashtags(hashtags, withLocations);
    }

    setIsLoading(false);
  };

  const onChange = (e) => {
    if (window.location.pathname === '/hashtags/' + e.value.replace('#', '')) {
      return;
    }

    router.push('/hashtags/' + e.value.replace('#', ''));
  };

  const onInputChange = (e) => {
    setText(e);

    if (e.length <= 1) {
      setAllOptions([...featuredOptions, ...randomHashtags]);
      return;
    }

    setAllOptions(allHashtags);
  };

  const onFocus = () => {
    updateHashtags();
  };

  useEffect(() => {
    if (!navigator.windowControlsOverlay) {
      return;
    }

    const theCustomStyles = {
      control: (base, state) => ({
        ...base,
        height: 'calc(env(titlebar-area-height, 34px) - 4px)',
        minHeight: 'calc(env(titlebar-area-height, 34px) - 4px)',
        border: state.isFocused ? '1px solid #2096cc' : '',
        boxShadow: state.isFocused ? '0px 0px 0px 1px #2096cc' : '',
      }),
      option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#2096cc' : 'inherit',
        '&:hover': {
          backgroundColor: state.isSelected ? '#2096cc' : '#deebff',
        },
      }),
      valueContainer: (provided) => ({
        ...provided,
        marginTop: 'calc(env(titlebar-area-height, 34px) - 39px)',
      }),
      indicatorsSeparator: (provided) => ({
        ...provided,
        marginTop: 2,
      }),
      indicatorsContainer: (provided) => ({
        ...provided,
        marginTop: -3,
      }),
    };

    const isOverlayVisible = navigator.windowControlsOverlay.visible;

    if (isOverlayVisible) {
      setCustomStyles(theCustomStyles);
    }

    const geometrychange = () => {
      const isOverlayVisible = navigator.windowControlsOverlay.visible;

      if (isOverlayVisible) {
        setCustomStyles(theCustomStyles);
        return;
      }

      setCustomStyles(defaultStyling);
    };

    navigator.windowControlsOverlay.addEventListener(
      'geometrychange',
      geometrychange
    );

    return () => {
      if (!navigator.windowControlsOverlay) {
        return;
      }

      navigator.windowControlsOverlay.removeEventListener(
        'geometrychange',
        geometrychange
      );
    };
  }, []);

  const handleShuffleClick = (e) => {
    if (
      e.nativeEvent instanceof PointerEvent &&
      e.nativeEvent.pointerType === 'touch'
    ) {
      return;
    }

    updateRandomHashtags(allHashtags, true);
  };

  const handleIncluceLocationsChange = (e) => {
    setWithLocationsChecked(e.target.checked);
    updateHashtags(e.target.checked, true);
  };

  const Menu = (props) => {
    return (
      <>
        <components.Menu {...props}>
          <div>
            <div>{props.children}</div>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                onChange={handleIncluceLocationsChange}
                checked={withLocationsChecked}
              />{' '}
              Include locations
            </label>
          </div>
          {text.length <= 1 && (
            <div style={{ textAlign: 'center', padding: 5 }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={handleShuffleClick}
                onTouchStart={handleShuffleClick}
              >
                {i18n('Shuffle')}
              </button>
            </div>
          )}
        </components.Menu>
      </>
    );
  };

  return (
    <div className="autocomplete">
      <Select
        suppressHydrationWarning
        options={allOptions}
        placeholder={i18n('Hashtag Search')}
        onInputChange={onInputChange}
        onChange={onChange}
        onFocus={onFocus}
        isLoading={isLoading}
        styles={customStyle}
        components={{ Menu }}
        instanceId={useId()}
      />
    </div>
  );
}
