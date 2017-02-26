import React, { PropTypes } from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import s from './Modal.css';

class Modal extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    isOpen: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node,
    /**
    * Called whenever the modal closes
    */
    onClose: PropTypes.func,
    /**
    * Called when the modal is approved (some successful event button)
    */
    onApprove: PropTypes.func,
    /**
    * Called whenever the modal is denied
    */
    onDeny: PropTypes.func,
  };

  static defaultProps = {
    isOpen: false,
  }

  static getBodyElement() {
    return process.env.BROWSER ? document.body : null;
  }

  constructor() {
    super();

    this.onClose = this.onClose.bind(this);
    this.onApprove = this.onApprove.bind(this);
    this.onDeny = this.onDeny.bind(this);
  }

  componentDidMount() {
    const bodyEl = Modal.getBodyElement();
    if (bodyEl != null) {
      bodyEl.classList.toggle('modal-open', this.props.isOpen);
      bodyEl.classList.toggle(s.modalDisableBody, this.props.isOpen);
    }
  }
  componentWillReceiveProps(nextProps) {
    const bodyEl = Modal.getBodyElement();
    if (bodyEl != null) {
      bodyEl.classList.toggle('modal-open', nextProps.isOpen);
      bodyEl.classList.toggle(s.modalDisableBody, nextProps.isOpen);
    }
  }
  componentWillUnmount() {
    const bodyEl = Modal.getBodyElement();
    if (bodyEl != null) {
      bodyEl.classList.remove('modal-open');
      bodyEl.classList.remove(s.modalDisableBody);
    }
  }

  onClose(e) {
    if (e.target !== this.overlayEl) {
      return true;
    }

    if (this.props.onClose) {
      this.props.onClose();
    }

    return false;
  }

  onApprove() {
    if (this.props.onApprove) {
      this.props.onApprove();
    }

    if (this.props.onClose) {
      this.props.onClose();
    }

    return false;
  }

  onDeny() {
    if (this.props.onDeny) {
      this.props.onDeny();
    }

    if (this.props.onClose) {
      this.props.onClose();
    }

    return false;
  }

  render() {
    const { title, isOpen, className, children } = this.props;

    if (isOpen) {
      return (
        <div className={s.modalOverlay}>
          <div
            className={s.modalWrapper}
            onClick={this.onClose}
            ref={(el) => { this.overlayEl = el; }}
          >
            <div className={cx(s.modal, ...(className || {}))}>
              <h4 className={s.title}>{title}</h4>
              <div className={s.content}>
                {children}
              </div>
              <div className={s.actions}>
                <button type="button" className={'mdl-button close'} onClick={this.onApprove}>Done</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }
}

export default withStyles(s)(Modal);
