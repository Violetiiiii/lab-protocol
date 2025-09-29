import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {/* 来自 docusaurus.config.ts 的站点标题 */}
          {siteConfig.title || '实验手册'}
        </Heading>
        <p className="hero__subtitle">
          {siteConfig.tagline || '实验步骤与配方'}
        </p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/intro/">
            开始阅读实验手册
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="实验手册"
      description="实验步骤、试剂配方与注意事项的在线手册"
    >
      <HomepageHeader />
      <main>
        <div className="container margin-vert--lg" style={{textAlign:'center'}}>
          <p>
            本站收录了常用实验流程、试剂配方与注意事项。可从上方按钮或左侧导航开始。
          </p>
        </div>
      </main>
    </Layout>
  );
}
