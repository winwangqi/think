import { Button } from '@douyinfe/semi-ui';
import { IconHorizontalRule } from 'components/icons';
import { Tooltip } from 'components/tooltip';
import React, { useCallback } from 'react';
import { Title } from 'tiptap/core/extensions/title';
import { Editor } from 'tiptap/editor';
import { useActive } from 'tiptap/editor/hooks/use-active';

export const HorizontalRule: React.FC<{ editor: Editor }> = ({ editor }) => {
  const isTitleActive = useActive(editor, Title.name);

  const setHorizontalRule = useCallback(() => editor.chain().focus().setHorizontalRule().run(), [editor]);

  return (
    <Tooltip content="插入分割线">
      <Button
        theme={'borderless'}
        type="tertiary"
        icon={<IconHorizontalRule />}
        onClick={setHorizontalRule}
        disabled={isTitleActive}
      />
    </Tooltip>
  );
};
