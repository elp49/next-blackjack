import styles from '../../styles/layout.module.css';

type HeaderProps = {};

const Header = ({}: HeaderProps) => (
  <header id={'header'}>
    <div className={styles.header}></div>
    <style jsx>{``}</style>
  </header>
);

export default Header;
