import { useState, useEffect } from 'react';
import { FaSun, FaMoon, FaCheck } from 'react-icons/fa';
import  { Link }  from 'react-router-dom'

   // Define the type for settings with an index signature
   type Settings = {
    [key: string]: string; // Index signature
    "--background-color": string;
    "--background-light": string;
    "--primary-color": string;
    "--shadow-color": string;
    "--text-color": string;
    "--text-light": string;
    "--font-size": string;
  };


const Setting : React.FC = () =>{

 
  
  const [settings, setSettings] = useState<Settings>(
    {
      "--background-color" : "#fff",
      "--background-light" : "#fff",
      "--primary-color" : "rgb(33,150,243)",
      "--shadow-color" : "rgba(0,0,0,0.2)",
      "--text-color": "#0A0A0A",
      "--text-light" : "#0A0A0A",
      "--font-size" : "16px"
    }
  )

  const [theme, setTheme] = useState("light");
  const themes : Settings[] = [
    {
      "--background-color" : "#fff",
      "--background-light" : "#fff",
      "--primary-color" : "rgb(33,150,243)",
      "--shadow-color" : "rgba(0,0,0,0.2)",
      "--text-color": "#0A0A0A",
      "--text-light" : "#0A0A0A",
      "--font-size" : "16px"

    },
    {
      "--background-color" : "rgb(29, 29, 29)",
      "--background-light" : "rgb(77, 77, 77)",
      "--primary-color" : "rgb(33,150,243)",
      "--shadow-color" : "rgba(0,0,0,0.2)",
      "--text-color" : "#ffffff",
      "--text-light" : "#eceaea",
      "--font-size" : "16px",
      
    }
  ];
 
  // Apply settings to the DOM whenever `settings` changes
  useEffect(() => {
    console.log(settings)
    const root = document.documentElement;
    for (let key in settings) {
      root.style.setProperty(key, settings[key]);
    }

    
  }, [settings]);


  // Function to change theme
  function changeTheme(i: number) {
    const _theme = { ...themes[i] };
    setTheme(i === 0 ? "light" : "dark");

    // Update settings
    let _settings = { ...settings };
    for (let key in _theme) {
      _settings[key] = _theme[key];
    }
    console.log("New settings:", _settings);
    localStorage.setItem("appSettings", JSON.stringify(_settings));
    setSettings(_settings);
  }



 
   


  
// Function to apply settings to the DOM
// function applySettingsToDOM(settings : Settings) {
//   const root = document.documentElement;
//   for (let key in settings) {
//     if (settings.hasOwnProperty(key)) {
//       root.style.setProperty(key, settings[key]);
//     }
//   }
  

//   }




  const primaryColors = [
    "rgb(33,150,243) ",
    "rgb(255,0,86) ",
    "rgb(255, 193, 7) ",
    "rgb(0, 200, 83) ",
    "rgb(156, 39, 176) "
  ]; 
  const [primaryColor, setPrimaryColor] = useState(0);
  function changeColor(i:number){
    const _color = primaryColors[i];

    let _settings = {...settings}
    _settings["--primary-color"] = _color;
    localStorage.setItem("appSettings", JSON.stringify(_settings));
    setPrimaryColor(i)
    setSettings(_settings)
  }
  const fontSizes = [
   {
    title : "SMALL",
    value  : "12px" 
   },
   {
    title : "MEDIUM",
    value  : "16px" 
   },
   {
    title : "LARGE",
    value  : "20px" 
   }

  ];
  function changeFontSize(i:number){
    const _size = fontSizes[i].value;
    let _settings = {... settings};
    _settings["--font-size"] = _size;
    localStorage.setItem("appSettings", JSON.stringify(_settings));
    setFontSize(i);
    setSettings(_settings);

  }

  const [fontSize, setFontSize] = useState(1);
  return(
    <>
    <div className='h-screen w-screen bg-[var(--background-light)] text-[var(--text-light)] '>
    <nav id='hell' className='flex items-center  justify-between border-b-[1px] bg-[var(--background-color)] border-b-black   w-screen'>
      <div className='w-[90px] h-[90px] bg-black'>  <img src="pam.png" alt="NOT FOUND" className='p-3' /></div>
       <div className='cursor-pointer font-bold'>
        <ul className='flex gap-20 '> 
       <Link to={"/header"}> <li className='hover:underline  font-bold text-[var(--text-color)]'>HOME</li></Link >
       <Link to={"/Jobs"}> <li className='hover:underline  font-bold text-[var(--text-color)]'>JOBS</li> </Link>
     <Link to={"/login"}>  <a href='#'> <li className='hover:underline  font-bold text-[var(--text-color)]'>LOG IN</li></a> </Link>
        <a href='#'><li className='hover:underline  font-bold text-[var(--text-color)]'>CONTACT</li></a>
        <Link to={"/setting"} ><  li className='underline  font-bold text-[--primary-color] '>SETTING</li>  </Link>
        </ul>
        </div>
      <div className='w-[90px] h-[90px] bg-black'>  <img src="pam.png" alt="NOT FOUND" className='p-3' /></div>  
        </nav>

        <div>
          <h2 id='hello' className=' font-bold text-2xl ml-96 mt-10 '>Prefered Themes</h2> <br />

          <div className='flex justify-center items-center bg-[var(--background-light)] text-[var(--text-color)] '    style={{
        // backgroundColor: `var(--background-color)`,
        // color: `var(--text-color)`,
        // fontSize: `var(--font-size)`,
      }}>

            <div  className='shadow-lg w-5/12 border-l-[--primary-color] border-l-4 flex  rounded-lg h-[16vh] '>
            
       
              <section >
                {/* <b className='text-black'>hello</b> */}
              <div onClick={()=> changeTheme(0)} className='bg-white shadow-lg  w-20 h-20 flex  justify-center items-center mt-2 rounded-lg ml-5'>
              {
                theme ==="light" && (
              
                  <div id='nawa' className='bg-blue-600   rounded-full h-10 w-10 flex justify-center items-center '>
                    
                    <FaSun className='text-white ' size={"15px"}/>
                    </div>
                )
              }
              </div>
              </section>
              <section>
               <div onClick={()=> changeTheme(1)} className='bg-black w-20 h-20 ml-5 flex justify-center items-center mt-2 rounded-lg shadow-lg'>
               {
                theme ==="dark" && (
                  <div id='nawa' className='bg-blue-600 rounded-full h-10 w-10 flex justify-center items-center   '>
                    <FaMoon className='text-white' size={"15px"}/></div>
                )
              }
               </div>
              </section>
             
             
            </div> 
          


  
          </div>
        
          <div >
          <h2 id='hello' className=' font-bold text-2xl ml-96 mt-10'>Primary Colors</h2>
          <div className='flex justify-center items-center bg-[var(--background-light)] text-[var(--text-color)]'>
            
          <div  className='shadow-lg w-5/12 border-l-4 border-l-[--primary-color] flex  rounded-lg h-[16vh] '>
            
             {
            primaryColors.map((color, index) => (
              <div className='shadow-lg   w-20 h-20 flex justify-center items-center mt-2 rounded-lg ml-5' style={{backgroundColor: color}}
              onClick={()=> changeColor(index)}>
              {
               primaryColor === index && (
                 <div className=''><FaCheck className='text-white' size={"15px"}/></div>
               )
             }
              </div>
            ))}
{/*        
              <section className='bg-blue-600 shadow-lg hover:w-28 hover:h-24  w-20 h-20 justify-center items-center mt-2 rounded-lg ml-5'>
                <b className='text-blue-600'>hello</b>
              <div className='bg-blue-600 rounded-full   h-10 w-10 flex justify-center items-center   ml-5'>
             
               <div><FaCheck className='text-white' size={"15px"}/></div>
             
              </div>
              </section> */}
              {/* <section>
               <div className='bg-red-600 hover:w-28 hover:h-24 flex justify-center items-center  w-20 h-20 ml-5 mt-2 rounded-lg shadow-lg'>
               <div><FaCheck className='text-red-600' size={"15px"}/></div>
               </div>
              </section>
              <section>
                <div className='bg-yellow-400 hover:w-28 hover:h-24 w-20 h-20 ml-5 mt-2 rounded-lg shadow-lg'>
                <div><FaCheck className='text-yellow-400' size={"15px"}/></div>
                </div>
              </section>
              <section>
                <div className='bg-green-600 hover:w-28 flex justify-center items-center hover:h-24 w-20 h-20 ml-5 mt-2 rounded-lg shadow-lg'>
                <div><FaCheck className='text-green-600' size={"15px"}/></div>
                </div>
              </section>
              <section>
                <div className='bg-purple-600 w-20 flex justify-center items-center h-20 ml-5 mt-2 hover:w-28 hover:h-24  rounded-lg shadow-lg'>
                <div><FaCheck className='text-purple-600' size={"15px"}/></div>
                </div>
              </section> */}
             
             
            </div> 
              
            </div>
          </div>
          <div >
          <h2 id='hello' className=' font-bold text-2xl ml-96 mt-10'>Font Size</h2>
          <div className='flex justify-center items-center bg-[var(--background-light)] text-[var(--text-light)]'>
          <div className='shadow-lg w-5/12 border-l-4 border-l-[--primary-color]  rounded-lg h-[16vh] '>
             
       
              <section>
                {/* <b className='text-white'>hello</b> */}
              {
                fontSizes.map((size, index)=>(
                  <button id='nawa' onClick={()=> changeFontSize(index)} className='bg-blue-500 text-white mt-8 ml-10 w-32 h-30 border-none hover:w-1/3 hover:h-1/3 '>
                 <span className='flex justify-center items-center'>
                 {size.title}
                 
                 {
                  fontSize === index && <FaCheck className='text-white ml-3' size={"15px"}/>
                 }
                 </span>
                
                   </button>
                ))
              }
              </section>
          
              
             
            
             
            </div> 
            
              
            </div>
            
          </div>



        </div>











    </div>
    </>
  )



}



export default Setting;