import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { injectIntl } from 'react-intl';
import { withStyles, withTheme } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
// import isBoolean from 'lodash/isBoolean';
import CommonHeader from './CommonHeader';
import NoteEditor from './NoteEditor';
import ExportPngDialog from '../dialogs/ExportPngDialog';
import ExportPdfDialog from '../dialogs/ExportPdfDialog';
import Icons from '../config/icons';
// import FocusBtn from './FocusBtn';
import SyncButton from './SyncButton';
import Scrollbar from './Scrollbar';
import WordCounterButton from './WordCounterButton';
import EditorContents from './editor/markdown/EditorContents';

const styles = (theme) => ({
  main: {
    backgroundColor: theme.custom.background.content,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    // overflowX: 'hidden',
  },
  main_green: {
    backgroundColor: theme.custom.background.contentGreen,
  },
  main_yellow: {
    backgroundColor: theme.custom.background.contentYellow,
  },
  header: {
    top: 0,
    height: 24,
    width: '100%',
    zIndex: 100,
    background: 'transparent',
  },
  header_mac: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    // padding: theme.spacing(3),
  },
  toolBar: {
    display: 'flex',
    position: 'absolute',
    right: theme.spacing(3),
    top: theme.spacing(8),
    bottom: theme.spacing(3),
    flexDirection: 'column',
    zIndex: 10,
    pointerEvents: 'none',
  },
  toolBar_mac: {
    top: theme.spacing(4),
  },
  iconButton: {
    '&:not(:nth-last-child(1))': {
      marginBottom: theme.spacing(2),
    },
    '&:hover $icon': {
      color: theme.custom.color.contentToolIconHover,
    },
    pointerEvents: 'all',
    marginBottom: 8,
  },
  emptyBlock: {
    flex: 1,
  },
  icon: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    color: theme.custom.color.contentToolIcon,
  },
  exportMenu: {
    '& .MuiPaper-elevation8': {
      boxShadow: '0px 1px 4px 0px rgba(0, 0, 0, 0.31)',
    },
    '& .MuiList-padding': {
      paddingTop: 4,
      paddingBottom: 4,
      color: theme.custom.color.noteTypeButton,
    },
    '& .MuiListItem-gutters': {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
    '& .MuiMenuItem-root': {
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1),
      fontSize: 15,
    },
    '& .Mui-disabled': {
      fontSize: 14,
      color: theme.custom.color.matchedText,
      opacity: 1,
    },
  },
  separator: {
    height: 1,
    backgroundColor: '#d8d8d8',
    margin: '4px 24px',
  },
  normalButton: {
    backgroundColor: 'transparent',
    color: theme.custom.color.forgetPasswordButton,
    '&:hover': {
      backgroundColor: 'transparent',
      color: theme.custom.color.forgetPasswordButton,
    },
  },
});

class Content extends React.Component {
  handler = {
    handleFullScreen: () => {
      this.props.onRequestFullScreen();
    },
    handleResize: () => {
      const isFullScreen = window.wizApi.windowManager.isFullScreen();
      if (isFullScreen !== this.state.isFullScreen) {
        this.setState({ isFullScreen });
      }
    },
    handleShowExportMenu: (e) => {
      this.setState({
        exportMenuAnchorEl: e.currentTarget,
      });
    },
    handleCloseExportMenu: () => {
      this.setState({
        exportMenuAnchorEl: null,
      });
    },
    handleShowContents: () => {
      this.setState({
        showEditorContents: true,
      });
    },
    handleCloseContents: () => {
      this.setState({
        showEditorContents: false,
      });
    },
    handleShowExportPngDialog: () => {
      this.handler.handleCloseExportMenu();
      //
      this.setState({ showExportPngDialog: true });
    },
    handleCloseExportPngDialog: () => {
      this.setState({ showExportPngDialog: false });
    },
    handleShowExportPdfDialog: () => {
      this.handler.handleCloseExportMenu();
      //
      this.setState({ showExportPdfDialog: true });
    },
    handleCloseExportPdfDialog: () => {
      this.setState({ showExportPdfDialog: false });
    },
    handleChangeEditorContents: (list) => {
      this.setState({
        contentsList: list,
      });
    },
    handleContentsNodeClick: (item) => {
      const element = document.querySelector(`#${item.key}`);
      element.scrollIntoView({
        behavior: 'smooth',
      });
    },
    handleExportMarkdown: async () => {
      const { kbGuid, note } = this.props;
      //
      if (!note.guid) return;
      //
      this.handler.handleCloseExportMenu();
      //
      try {
        await window.wizApi.userManager.writeToMarkdown(kbGuid, note.guid, {});
      } catch (err) {
        alert(err.message);
      }
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      isFullScreen: false,
      exportMenuAnchorEl: null,
      showExportPngDialog: false,
      showExportPdfDialog: false,
      showEditorContents: false,
      contentsList: [],
    };
    this.scrollContentRef = React.createRef();
    this.headerRef = React.createRef();
  }

  componentDidMount() {
    window.addEventListener('resize', this.handler.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handler.handleResize);
  }

  render() {
    const {
      note, kbGuid, classes,
      theme, backgroundType, onClickTag,
      intl,
    } = this.props;
    const {
      isFullScreen, exportMenuAnchorEl, showExportPngDialog,
      showExportPdfDialog,
    } = this.state;
    //
    const isLite = theme.palette.type !== 'dark';
    const backgroundColorClassName = `main_${backgroundType}`;
    const backgroundClass = isLite && (classes[backgroundColorClassName] ?? '');

    const isMac = window.wizApi.platform.isMac;
    const hasFullScreenButton = window.wizApi.isElectron && isMac;

    return (
      <main
        className={classNames(classes.main, backgroundClass)}
      >
        <CommonHeader
          systemButton
          className={classNames(classes.header, isMac && classes.header_mac)}
          onRequestFullScreen={this.props.onRequestFullScreen}
          ref={this.headerRef}
        />
        {!this.state.showEditorContents && note && (
        <div className={classNames(classes.toolBar, isMac && classes.toolBar_mac)}>
          {/* <IconButton className={classes.iconButton}>
            <Icons.MoreHorizIcon className={classes.icon} />
          </IconButton> */}
          {/* <IconButton className={classes.iconButton}>
            <Icons.TableContentIcon className={classes.icon} />
          </IconButton> */}
          {/* <IconButton className={classes.iconButton}>
            <Icons.LinkIcon className={classes.icon} />
          </IconButton> */}
          {hasFullScreenButton && (
          <IconButton className={classes.iconButton} onClick={this.handler.handleFullScreen}>
            {isFullScreen && <Icons.QuitFullScreenIcon className={classes.icon} />}
            {!isFullScreen && <Icons.FullScreenIcon className={classes.icon} />}
          </IconButton>
          )}
          <IconButton className={classes.iconButton} onClick={this.handler.handleShowContents}>
            <Icons.OutlineIcon className={classes.icon} />
          </IconButton>
          <IconButton className={classes.iconButton} onClick={this.handler.handleShowExportMenu}>
            <Icons.ExportIcon className={classes.icon} />
          </IconButton>
          <div className={classes.emptyBlock} />
          <WordCounterButton
            className={classes.iconButton}
            iconClassName={classes.icon}
            onCreateAccount={this.props.onCreateAccount}
            kbGuid={kbGuid}
            note={note}
          />
          <SyncButton
            className={classes.iconButton}
            iconClassName={classes.icon}
            onCreateAccount={this.props.onCreateAccount}
            kbGuid={kbGuid}
            note={note}
          />
          {/* Focus 模式不完善，暂时屏蔽 */}
          {/* <FocusBtn className={classes.iconButton} iconClassName={classes.icon} /> */}
        </div>
        )}
        <div className={classes.content}>
          <Scrollbar ref={this.scrollContentRef}>
            <NoteEditor
              note={note}
              kbGuid={kbGuid}
              onClickTag={onClickTag}
              scrollbar={this.scrollContentRef.current ?? null}
              onUpdateContentsList={this.handler.handleChangeEditorContents}
            />
          </Scrollbar>
          <EditorContents
            contents={this.state.contentsList}
            open={note && this.state.showEditorContents}
            onClose={this.handler.handleCloseContents}
            onNodeClick={this.handler.handleContentsNodeClick}
            isShowDrawer={this.props.isShowDrawer}
          />
        </div>
        <Menu
          className={classes.exportMenu}
          getContentAnchorEl={null}
          anchorEl={exportMenuAnchorEl}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          open={!!exportMenuAnchorEl}
          onClose={this.handler.handleCloseExportMenu}
        >
          <MenuItem onClick={this.handler.handleShowExportPngDialog}>
            {intl.formatMessage({ id: 'exportPng' })}
          </MenuItem>
          <MenuItem onClick={this.handler.handleExportMarkdown}>
            {intl.formatMessage({ id: 'exportMd' })}
          </MenuItem>
          <MenuItem onClick={this.handler.handleShowExportPdfDialog}>
            {intl.formatMessage({ id: 'exportPdf' })}
          </MenuItem>
          {/* <MenuItem>
            {intl.formatMessage({ id: 'copySourceMarkdown' })}
          </MenuItem> */}
          {/* <div className={classes.separator} /> */}
          {/* <MenuItem disabled>
            {intl.formatMessage({ id: 'publishTo' })}
          </MenuItem> */}
          {/* <MenuItem
            disableRipple
            className={classes.normalButton}
          >
            {intl.formatMessage({ id: 'settingPublishPlatform' })}
          </MenuItem> */}
        </Menu>
        <ExportPngDialog
          open={showExportPngDialog}
          kbGuid={kbGuid}
          noteGuid={note?.guid ?? null}
          onClose={this.handler.handleCloseExportPngDialog}
        />
        <ExportPdfDialog
          open={showExportPdfDialog}
          kbGuid={kbGuid}
          noteGuid={note?.guid ?? null}
          onClose={this.handler.handleCloseExportPdfDialog}
        />
      </main>
    );
  }
}

Content.propTypes = {
  theme: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
  kbGuid: PropTypes.string.isRequired,
  // isSearch: PropTypes.bool.isRequired,
  note: PropTypes.object,
  backgroundType: PropTypes.string,
  onCreateAccount: PropTypes.func.isRequired,
  onClickTag: PropTypes.func.isRequired,
  onRequestFullScreen: PropTypes.func.isRequired,
  isShowDrawer: PropTypes.bool,
};

Content.defaultProps = {
  note: null,
  backgroundType: 'white',
  isShowDrawer: false,
};

export default withTheme(withStyles(styles)(injectIntl(Content)));
