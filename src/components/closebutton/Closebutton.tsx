import './Closebutton.css';
import closeImage from '../../assets/images/close.svg';


const Closebutton = ({closeAction}: {closeAction: () => void}) => {
    return (
        <button className='close-button' onClick={closeAction}>
            <img src={closeImage} alt="close" height={20}/>
        </button>
    );
};

export default Closebutton;
