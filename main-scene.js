window.Assignment_Two_Test = window.classes.Assignment_Two_Test =
class Assignment_Two_Test extends Scene_Component
  { constructor( context, control_box )     // The scene begins by requesting the camera, shapes, and materials it will need.
      { super(   context, control_box );    // First, include a secondary Scene that provides movement controls:
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,10,20 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );
        this.initial_camera_location = Mat4.inverse( context.globals.graphics_state.camera_transform );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = { torus:  new Torus( 15, 15 ),
                         torus2: new ( Torus.prototype.make_flat_shaded_version() )( 15, 15 ),
 
                                // TODO:  Fill in as many additional shape instances as needed in this key/value table.
                                //        (Requirement 1)

                         sphere1: new ( Subdivision_Sphere.prototype.make_flat_shaded_version() )(1),
                         sphere2: new ( Subdivision_Sphere.prototype.make_flat_shaded_version() )(2),
                         sphere3: new Subdivision_Sphere(3),
                         sphere4: new Subdivision_Sphere(4)

                       }
        this.submit_shapes( context, shapes );
                                     
                                     // Make some Material objects available to you:
        this.materials =
          { test:     context.get_instance( Phong_Shader ).material( Color.of( 1,1,0,1 ), { ambient:.2 } ),
            ring:     context.get_instance( Ring_Shader  ).material(),

                                // TODO:  Fill in as many additional material objects as needed in this key/value table.
                                //        (Requirement 1)

            sun:      context.get_instance( Phong_Shader ).material( Color.of(1,1,0,1), {ambient: 1} ),
            planet:   context.get_instance( Phong_Shader ).material( Color.of(1,1,1,1) )
          }

        this.lights = [ new Light( Vec.of( 5,-10,5,1 ), Color.of( 0, 1, 1, 1 ), 1000 ) ];
      }



    make_control_panel()            // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
      { this.key_triggered_button( "View solar system",  [ "0" ], () => this.attached = () => this.initial_camera_location );
        this.new_line();
        this.key_triggered_button( "Attach to planet 1", [ "1" ], () => this.attached = () => this.planet_1 );
        this.key_triggered_button( "Attach to planet 2", [ "2" ], () => this.attached = () => this.planet_2 ); this.new_line();
        this.key_triggered_button( "Attach to planet 3", [ "3" ], () => this.attached = () => this.planet_3 );
        this.key_triggered_button( "Attach to planet 4", [ "4" ], () => this.attached = () => this.planet_4 ); this.new_line();
        this.key_triggered_button( "Attach to planet 5", [ "5" ], () => this.attached = () => this.planet_5 );
        this.key_triggered_button( "Attach to moon",     [ "m" ], () => this.attached = () => this.moon     );
      }



    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

        // TODO:  Fill in matrix operations and drawing code to draw the solar system scene (Requirements 2 and 3)
        
        // Setup Sun
        let sun = Mat4.identity()                                           // Setup sun at origin
        let sunOrigin = sun                                                 // Save sun's origin for planet's to revolve around
        var sunScale = Math.sin(1.25 * t - (Math.PI / 2) )  + 2             // Change sun's scale from 1 to 3 in 5 second period
        var sunColorRed = 0.5 * Math.sin(1.25 * t - (Math.PI / 2)) + 0.5    // Changes red from 0 to 1 in 5 second period
        var sunColorBlue = -0.5 * Math.sin(1.25 * t - (Math.PI / 2)) + 0.5  // Changes blue from 1 to 0 in 5 second period
        sun = sun.times(Mat4.scale([sunScale, sunScale, sunScale]))         // Initial radius: 1, 2.5 sec: 3, 5 sec: 1
        this.shapes.sphere4.draw(graphics_state, sun, this.materials.sun.override( {color: Color.of (sunColorRed, 0, sunColorBlue, 1)} )) // Draw sun

        

        // Setup Sun Light
        let sunLight  = [ new Light ( Vec.of( 0,0,0,1 ), Color.of(sunColorRed, 0, sunColorBlue, 1), 10 ** sunScale) ]
        graphics_state.lights = sunLight



        // Setup Planet 1
        let planet1 = sunOrigin.times(Mat4.rotation(1.25 * t, Vec.of(0, 1, 0)))  // Rotote about the origin
                         .times(Mat4.translation([5,0,0]))                      // Model transform translate to +5 units on the x axis
                         .times(Mat4.rotation(1.25 * t, Vec.of(0, 1, 0)))        // Rotate about the center of the planet
                         .times(Mat4.scale([1, 1, 1]))                          // Radius of 1
                          
        this.shapes.sphere2.draw(graphics_state, planet1, this.materials.planet.override( {color: Color.of (0.5,0.5,0.5, 1), diffusivity: 1} ))


        // Setup Planet 2
        let planet2 = sunOrigin.times(Mat4.rotation(1 * t, Vec.of(0, 1, 0))) 
                               .times(Mat4.translation([8,0,0]))      
                               .times(Mat4.rotation(1 * t, Vec.of(0, 1, 0)))  
                               .times(Mat4.scale([1, 1, 1]))  
                                          
        var gouraudColor = (Math.floor(t) % 2 == 0 ) ? 0 : 1     // Apply Gouraud shading if t is an odd second
        this.shapes.sphere3.draw(graphics_state, planet2, this.materials.planet.override( {color: Color.of(0.2, 1, 0.5, 1), specularity: 1, diffusivity: 0.2, gouraud: gouraudColor} ))


        // Setup Planet 3
        let planet3 = sunOrigin.times(Mat4.rotation(0.75 * t, Vec.of(0, 1, 0))) 
                               .times(Mat4.translation([11,0,0]))      
                               .times(Mat4.rotation(0.75 * t, Vec.of(0, 1, 1)))  // Make planet wobble by rotating it on a different axis
                               .times(Mat4.scale([1, 1, 1]))

        let planet3Rings = planet3.times(Mat4.scale([1, 1, 0.1]))             // Scale rings down on the z axis

        this.shapes.sphere4.draw(graphics_state, planet3, this.materials.planet.override( {color: Color.of(0.65, 0.4, 0.05, 1), specularity: 1, diffusivity: 1} ))
        this.shapes.torus.draw(graphics_state, planet3Rings, this.materials.planet.override( {color: Color.of(0.65, 0.4, 0.05, 1), specularity: 1, diffusivity: 1} ))


        // Setup Planet 4
        let planet4 = sunOrigin.times(Mat4.rotation(0.5 * t, Vec.of(0, 1, 0))) 
                               .times(Mat4.translation([14,0,0]))      
                               .times(Mat4.rotation(0.5 * t, Vec.of(0, 1, 0)))  
                               .times(Mat4.scale([1, 1, 1])) 

        let planet4Moon = planet4.times(Mat4.rotation(0.25 * t, Vec.of(0, 1, 0))) 
                               .times(Mat4.translation([2,0,0]))      
                               .times(Mat4.rotation(2 * t, Vec.of(0, 1, 0)))  
                               .times(Mat4.scale([1, 1, 1]))

        this.shapes.sphere4.draw(graphics_state, planet4, this.materials.planet.override( {color: Color.of(0, 0.1, 0.6, 1), specularity: 0.8, smoothness: 100} ))
        this.shapes.sphere1.draw(graphics_state, planet4Moon, this.materials.planet.override( {color: Color.of(0, 0.3, 0, 1)} ))


        // Setup Planet 5
        let planet5 = sunOrigin.times(Mat4.rotation(0.25 * t, Vec.of(0, 1, 0))) 
                               .times(Mat4.translation([15,0,0]))      
                               .times(Mat4.rotation(0.25 * t, Vec.of(0, 1, 0)))  
                               .times(Mat4.scale([1, 1, 1])) 
        
        
        // Setup Camera Positions
        this.initial_camera_location = Mat4.look_at( Vec.of( 0,10,20 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) ).map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, 0.1 ) )
        this.planet_1 = Mat4.inverse(planet1.times(Mat4.translation([0,0,5]))).map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, 0.1 ) )
        this.planet_2 = Mat4.inverse(planet2.times(Mat4.translation([0,0,5]))).map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, 0.1 ) )
        this.planet_3 = Mat4.inverse(planet3.times(Mat4.translation([0,0,5]))).map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, 0.1 ) )
        this.planet_4 = Mat4.inverse(planet4.times(Mat4.translation([0,0,5]))).map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, 0.1 ) )
        this.planet_5 = Mat4.inverse(planet5.times(Mat4.translation([0,0,5]))).map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, 0.1 ) )
        this.moon = Mat4.inverse(planet4Moon.times(Mat4.translation([0,0,5]))).map( (x,i) => Vec.from( graphics_state.camera_transform[i] ).mix( x, 0.1 ) )

        // If this.attached is defined (A key/button is pressed)
        if (typeof this.attached !== 'undefined')
        {
          switch(this.attached())
          {
            case this.initial_camera_location:
              graphics_state.camera_transform = this.initial_camera_location
              break;

            case this.planet_1:
              graphics_state.camera_transform = this.planet_1
              break;

            case this.planet_2:
              graphics_state.camera_transform = this.planet_2
              break;

            case this.planet_3:
              graphics_state.camera_transform = this.planet_3
              break;

            case this.planet_4:
              graphics_state.camera_transform = this.planet_4
              break;

            case this.planet_5:
              graphics_state.camera_transform = this.planet_5
              break;

            case this.moon:
              graphics_state.camera_transform = this.moon
              break;
          }
        }

        
      }
  }



// Extra credit begins here (See TODO comments below):

window.Ring_Shader = window.classes.Ring_Shader =
class Ring_Shader extends Shader              // Subclasses of Shader each store and manage a complete GPU program.
{ material() { return { shader: this } }      // Materials here are minimal, without any settings.
  map_attribute_name_to_buffer_name( name )       // The shader will pull single entries out of the vertex arrays, by their data fields'
    {                                             // names.  Map those names onto the arrays we'll pull them from.  This determines
                                                  // which kinds of Shapes this Shader is compatible with.  Thanks to this function, 
                                                  // Vertex buffers in the GPU can get their pointers matched up with pointers to 
                                                  // attribute names in the GPU.  Shapes and Shaders can still be compatible even
                                                  // if some vertex data feilds are unused. 
      return { object_space_pos: "positions" }[ name ];      // Use a simple lookup table.
    }
    // Define how to synchronize our JavaScript's variables to the GPU's:
  update_GPU( g_state, model_transform, material, gpu = this.g_addrs, gl = this.gl )
      { const proj_camera = g_state.projection_transform.times( g_state.camera_transform );
                                                                                        // Send our matrices to the shader programs:
        gl.uniformMatrix4fv( gpu.model_transform_loc,             false, Mat.flatten_2D_to_1D( model_transform.transposed() ) );
        gl.uniformMatrix4fv( gpu.projection_camera_transform_loc, false, Mat.flatten_2D_to_1D(     proj_camera.transposed() ) );
      }
  shared_glsl_code()            // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
    { return `precision mediump float;
              varying vec4 position;
              varying vec4 center;
      `;
    }
  vertex_glsl_code()           // ********* VERTEX SHADER *********
    { return `
        attribute vec3 object_space_pos;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_transform;

        void main()
        { 
        }`;           // TODO:  Complete the main function of the vertex shader (Extra Credit Part II).
    }
  fragment_glsl_code()           // ********* FRAGMENT SHADER *********
    { return `
        void main()
        { 
        }`;           // TODO:  Complete the main function of the fragment shader (Extra Credit Part II).
    }
}

window.Grid_Sphere = window.classes.Grid_Sphere =
class Grid_Sphere extends Shape           // With lattitude / longitude divisions; this means singularities are at 
  { constructor( rows, columns, texture_range )             // the mesh's top and bottom.  Subdivision_Sphere is a better alternative.
      { super( "positions", "normals", "texture_coords" );
        

                      // TODO:  Complete the specification of a sphere with lattitude and longitude lines
                      //        (Extra Credit Part III)
      } }