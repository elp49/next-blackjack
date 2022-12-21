import styles from '../../styles/layout.module.css';

type FooterProps = {};

const Footer = ({}: FooterProps) => (
  <footer id={'footer'}>
    <div className={styles.footer}>
      {/* <small>
        Copyright &copy; {new Date().getFullYear()} <strong>Open Door Christian Community.</strong> All Rights Reserved
      </small> */}
    </div>
    <style jsx>{``}</style>
  </footer>
);

export default Footer;
