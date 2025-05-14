return (
  <div className="app-container">
    <Header account={account} isVerified={isVerified} />
    
    {!isCorrectNetwork && <NetworkAlert />}
    
    <div className="main-content">
      {!account ? (
        <div className="connect-section">
          <button className="connect-btn" onClick={connectWallet}>
            Connect MetaMask
          </button>
          <VerificationMessage />
        </div>
      ) : !isVerified ? (
        <div className="verification-section">
          <VerificationMessage />
          <button 
            className="verify-btn" 
            onClick={verifyWallet}
            disabled={isLoading}
          >
            {isLoading ? 'Waiting for Signature...' : 'Verify Wallet'}
          </button>
        </div>
      ) : showLeaderboard ? (
        <LeaderboardScreen 
          players={players} 
          onBackClick={() => setShowLeaderboard(false)}
          onRefresh={loadLeaderboard}
          account={account}
        />
      ) : (
        <>
          <div className="mint-section">
            <MintButton 
              assetType="NFT"
              isMinted={nftStatus.isMinted}
              isProcessing={nftStatus.isProcessing}
              onClick={() => handleMint('NFT')}
            />
            <MintButton 
              assetType="USDCard"
              isMinted={usdcardStatus.isMinted}
              isProcessing={usdcardStatus.isProcessing}
              onClick={() => handleMint('USDCard')}
            />
          </div>
          <GameSection 
            account={account} 
            contracts={contracts} 
            onLeaderboardClick={() => {
              loadLeaderboard();
              setShowLeaderboard(true);
            }}
          />
        </>
      )}
    </div>

    {error && (
      <div className="error-popup">
        {error}
        <button onClick={() => setError(null)}>×</button>
      </div>
    )}
  </div>
);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);