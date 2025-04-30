const ChatRulesModal = ({ onAccept, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Правила чата</h2>
        <div className="rules-text">
          <p>1. No harassment, hate speech, or NSFW content</p>
          <p>2. No spam or advertisements</p>
          <p>3. Violations may result in a ban</p>
          <p>4. By clicking "Agree" you accept these rules</p>
        </div>
        <div className="modal-buttons">
          <button onClick={onClose}>Отмена</button>
          <button onClick={onAccept}>Я согласен</button>
        </div>
      </div>
    </div>
  );
};

export default ChatRulesModal;