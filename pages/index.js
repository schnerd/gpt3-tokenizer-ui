import {useState, useEffect, useCallback} from 'react';
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {createTokenizer} from "../utils/tokenizer";
import {LONG_TEXT, SHORT_TEXT} from "../utils/text-samples";

const colors = [
  '#27ae60',
  '#2980b9',
  '#8e44ad',
];

export default function Home() {
  const [tokenizer, setTokenizer] = useState(null);
  const [text, setText] = useState('');
  const [results, setResults] = useState(null);
  const [time, setTime] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/encoder.json').then(resp => resp.json()),
      fetch('/vocab.bpe').then(resp => resp.text()),
    ]).then(([encoder, vocab]) => {
      const tokenizer = createTokenizer(encoder, vocab);
      setTokenizer(tokenizer);
    }).catch(err => {
      alert(err.message);
    });
  }, []);

  const run = useCallback((text) => {
    if (!tokenizer) {
      return;
    }
    const t1 = Date.now();
    const [, encodedTokens] = tokenizer.encode(text);
    const t2 = Date.now();
    setResults(encodedTokens);
    setTime(t2 - t1);
  }, [tokenizer]);

  const onTextChange = useCallback((evt) => {
    setText(evt.target.value);
    run(evt.target.value);
  }, [run]);

  const onClear = useCallback(() => {
    setResults(null);
    setText('');
    setTime(null);
  }, []);

  const onTry = useCallback((text) => {
    setText(text);
    run(text);
  }, [run]);

  return (
    <div className={styles.container}>
      <Head>
        <title>GPT-3 Tokenizer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.headings}>
          <h1 className={styles.title}>
            GPT3-Tokenizer
          </h1>

          <p className={styles.description}>
            Enter some text and watch the GPT-2/3 tokenizer work in realtime
          </p>

          <p className={styles.credits}>
            Based on <a href="https://github.com/AIDungeon/GPT-3-Encoder">GPT-3-Encoder by AI Dungeon</a>
          </p>
        </div>

        <div className={`${styles.grid} ${!tokenizer ? styles.loading : ''}`}>
          <div className={styles.left}>
            <textarea
              className={styles.textarea}
              placeholder={tokenizer ? "Enter some text" : 'Loading tokenizer vocabular...'}
              value={text}
              onChange={onTextChange}
            />
            <div className={styles.shortcuts}>
              <button className={styles.shortcut} onClick={onClear}>Clear</button>
              <button className={styles.shortcut} onClick={() => onTry(SHORT_TEXT)}>Try Short</button>
              <button className={styles.shortcut} onClick={() => onTry(LONG_TEXT)}>Try Long</button>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.stats}>
              <div>Tokens: <strong>{results && results.length ? results.length : '–'}</strong></div>
              <div>Chars: <strong>{text ? text.length : '–'}</strong></div>
              <div>Char/Token: <strong>{text && results ? Math.round(100 * text.length / results.length) / 100 : '–'}</strong></div>
              <div>Time: <strong>{text && time !== null ? `${time}ms` : '–'}</strong></div>
            </div>
            <div className={styles.tokens}>
              {(results || []).map((token, i) => (
                <span key={`tok${i}-${token}`} style={{color: colors[i % colors.length]}}>{token}</span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
