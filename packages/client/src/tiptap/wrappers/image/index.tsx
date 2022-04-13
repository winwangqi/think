import cls from 'classnames';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Typography, Spin } from '@douyinfe/semi-ui';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Resizeable } from 'components/resizeable';
import { useToggle } from 'hooks/use-toggle';
import { uploadFile } from 'services/file';
import { extractFileExtension, extractFilename, getImageWidthHeight } from '../../utils/file';
import styles from './index.module.scss';

const { Text } = Typography;

export const ImageWrapper = ({ editor, node, updateAttributes }) => {
  const isEditable = editor.isEditable;
  const { hasTrigger, error, src, alt, title, width, height, textAlign } = node.attrs;
  const $upload = useRef<HTMLInputElement>();
  const [loading, toggleLoading] = useToggle(false);

  const onResize = useCallback((size) => {
    updateAttributes({ height: size.height, width: size.width });
  }, []);

  const selectFile = useCallback(() => {
    if (!isEditable || error || src) return;
    isEditable && $upload.current.click();
  }, [isEditable, error, src]);

  const handleFile = useCallback(async (e) => {
    const file = e.target.files && e.target.files[0];

    const fileInfo = {
      fileName: extractFilename(file.name),
      fileSize: file.size,
      fileType: file.type,
      fileExt: extractFileExtension(file.name),
    };

    toggleLoading(true);

    try {
      const src = await uploadFile(file);
      const size = await getImageWidthHeight(file);
      updateAttributes({ ...fileInfo, ...size, src });
      toggleLoading(false);
    } catch (error) {
      updateAttributes({ error: '图片上传失败：' + (error && error.message) || '未知错误' });
      toggleLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!src && !hasTrigger) {
      selectFile();
      updateAttributes({ hasTrigger: true });
    }
  }, [src, hasTrigger]);

  const content = useMemo(() => {
    if (error) {
      return (
        <div className={cls(styles.wrap, 'render-wrapper')}>
          <Text>{error}</Text>
        </div>
      );
    }

    if (!src) {
      return (
        <div className={cls(styles.wrap, 'render-wrapper')} onClick={selectFile}>
          <Spin spinning={loading}>
            <Text style={{ cursor: 'pointer' }}>{loading ? '正在上传中' : '请选择图片'}</Text>
            <input ref={$upload} accept="image/*" type="file" hidden onChange={handleFile} />
          </Spin>
        </div>
      );
    }

    const img = <LazyLoadImage src={src} alt={alt} width={width} height={height} />;

    if (isEditable) {
      return (
        <Resizeable className={cls('render-wrapper')} width={width} height={height} onChange={onResize}>
          {img}
        </Resizeable>
      );
    }

    return (
      <div className={cls('render-wrapper')} style={{ display: 'inline-block', width, height, maxWidth: '100%' }}>
        {img}
      </div>
    );
  }, [error, src, isEditable]);

  return (
    <NodeViewWrapper as="div" style={{ textAlign, fontSize: 0, maxWidth: '100%' }}>
      {content}
      <NodeViewContent />
    </NodeViewWrapper>
  );
};
