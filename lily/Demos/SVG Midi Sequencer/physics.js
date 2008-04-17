
/* START PHYSICS */


/*
	javascript port of traer physics - http://www.cs.princeton.edu/~traer/physics/
*/

//----------------------utils.js-----------------------//

const LOMONT_MAGIC_NUMBER = 0x5f375a86;

//FIXME *** needs optimization
function fastInverseSqrt(x)
{
	return (1.0/Math.sqrt(x));	
}
//----------------------Vector3D.js-----------------------//

//package traer.physics;

function Vector3D() //float X, float Y, float Z || Vector3D p || undefined
{
	this.x = 0.0;
	this.y = 0.0;
	this.z = 0.0;

	if(arguments.length == 3) {
        this.x = parseFloat(arguments[0]);
        this.y = parseFloat(arguments[1]);
        this.z = parseFloat(arguments[2]);
	} else if(arguments.length == 1 && typeof arguments[0] == "object") {
        this.x = arguments[0].x;
        this.y = arguments[0].y;
        this.z = arguments[0].z;
	}

    this.getZ=function() //changing these from z() to getZ()
    {
        return this.z;
    }

    this.getY=function()
    {
        return this.y;
    }

    this.getX=function()
    {
        return this.x;
    }

    this.setX=function(X)
    {
        this.x = X;
    }

    this.setY=function(Y)
    {
        this.y = Y;
    }

    this.setZ=function(Z)
    {
        this.z = Z;
    }

    this.set=function()
    {
		if(arguments.length==3) {
			this.x = arguments[0];
	        this.y = arguments[1];
	        this.z = arguments[2];
		} else if(arguments.length==1 && typeof arguments[0] == "object") {
	        this.x = arguments[0].x;
	        this.y = arguments[0].y;
	        this.z = arguments[0].z;			
		}	
    }

    this.add=function()
    {
		if(arguments.length==3) {
			this.x += arguments[0];
	        this.y += arguments[1];
	        this.z += arguments[2];
		} else if(arguments.length==1 && typeof arguments[0] == "object") {
	        this.x += arguments[0].x;
	        this.y += arguments[0].y;
	        this.z += arguments[0].z;			
		}
        return this;
    }

    this.subtract=function(p)
    {
        this.x -= p.x;
        this.y -= p.y;
        this.z -= p.z;
    }

    this.plus=function(p)
    {
        return new Vector3D(this.x + p.x, this.y + p.y, this.z + p.z);
    }

    this.times=function(f)
    {
        return new Vector3D(this.x * f, this.y * f, this.z * f);
    }

    this.over=function(f)
    {
        return new Vector3D(this.x / f, this.y / f, this.z / f);
    }

    this.minus=function(p)
    {
        return new Vector3D(this.x - p.x, this.y - p.y, this.z - p.z);
    }

    this.multiplyBy=function(f)
    {
        this.x *= f;
        this.y *= f;
        this.z *= f;
        return this;
    }

    this.distanceTo=function(p)
    {
        var dx = this.x - p.x;
        var dy = this.y - p.y;
        var dz = this.z - p.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    this.distanceTo=function(_x, _y, _z)
    {
        var dx = this.x - _x;
        var dy = this.y - _y;
        var dz = this.z - _z;
        return 1.0 / fastInverseSqrt(dx * dx + dy * dy + dz * dz);
    }

    this.dot=function(p)
    {
        return this.x * p.x + this.y * p.y + this.z * p.z;
    }

    this.length=function()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    this.unit=function()
    {
        var l = this.length();
        return l != 0.0 ? this.over(l) : new Vector3D();
    }

    this.clear=function()
    {
        this.x = 0.0;
        this.y = 0.0;
        this.z = 0.0;
    }

    this.toString=function()
    {
        return new String("(" + this.x + ", " + this.y + ", " + this.z + ")");
    }

    this.cross=function(p)
    {
        return new Vector3D(this.y * p.z - this.z * p.y, this.x * p.z - this.z * p.x, this.x * p.y - this.y * p.x);
    }

}
//----------------------Particle.js-----------------------//

//package traer.physics;


// Referenced classes of package traer.physics: Vector3D

function Particle(/*float*/ m, /*Vector3D*/ p)
{
	this.position = p||new Vector3D(); //vector
	this.velocity = new Vector3D(); //vector
	this.force = new Vector3D(); //vector
	this.mass = m||0; //vector
	this.fixed = false;
	this.age = 0.0; //0.0F
	this.dead = false;

    this.moveTo=function(x, y, z)
    {
        this.position.set(x, y, z);
    }

    this.moveBy=function(x, y, z)
    {
        this.position.x += x;
        this.position.y += y;
        this.position.z += z;
    }

    this.addVelocity=function(x, y, z)
    {
        this.velocity.x += x;
        this.velocity.y += y;
        this.velocity.z += z;
    }

    this.setForce=function(x, y, z)
    {
        this.force.set(x, y, z);
    }

    this.makeFixed=function()
    {		
        this.fixed = true;
        this.velocity.clear();
    }

    this.isFixed=function()
    {
        return this.fixed;
    }

    this.isFree=function()
    {
        return !this.fixed;
    }

    this.makeFree=function()
    {
        this.fixed = false;
    }

	//used to be position()
    this.getPosition=function()
    {
        return this.position;
    }

    this.setVelocity=function(x, y, z)
    {
        this.velocity.set(x, y, z);
    }

	//used to velocity()
    this.getVelocity=function() //change from velocity
    {
        return this.velocity;
    }

    this.getMass=function()
    {
        return this.mass;
    }

	//used to be mass()
    this.setMass=function(m)
    {
        this.mass = m;
    }

    this.getForce=function()
    {
        return this.force;
    }

	//used to be age()
    this.getAge=function()
    {
        return this.age;
    }

    this.kill=function()
    {
        this.dead = true;
    }

    this.isDead=function()
    {
        return this.dead;
    }

}
//----------------------Attraction.js-----------------------//


//package traer.physics;

// Referenced classes of package traer.physics: Force, Particle, Vector3D
// implements Force

function Attraction(/* Particle */ a, /* Particle */ b, /* float */ k, /* float */ distanceMin)
{

    this.a = a||null; //particle
    this.b = b||null; //particle
    this.k = k||0; //float
    var on = true; //bool	
    this.distanceMin = distanceMin||0; //distance min

    this.getMinimumDistance=function()
    {
        return this.distanceMin;
    }

    this.setMinimumDistance=function(d)
    {
        this.distanceMin = d;
    }

    this.turnOff=function()
    {
        on = false;
    }

    this.turnOn=function()
    {
        on = true;
    }

    this.setStrength=function(k)
    {
        this.k = k;
    }

    this.getOneEnd=function()
    {
        return this.a;
    }

    this.getTheOtherEnd=function()
    {
        return this.b;
    }

    this.apply=function()
    {
        if(on)
        {
            var a2bX = a.getPosition().x - b.getPosition().x;
            var a2bY = a.getPosition().y - b.getPosition().y;
            var a2bZ = a.getPosition().z - b.getPosition().z;
            var oneOvera2bDistance = fastInverseSqrt(a2bX * a2bX + a2bY * a2bY + a2bZ * a2bZ);
            var a2bDistance = 1.0 / oneOvera2bDistance;
            if(a2bDistance == 0.0)
                return;
            a2bX *= oneOvera2bDistance;
            a2bY *= oneOvera2bDistance;
            a2bZ *= oneOvera2bDistance;
            var force = k * a.mass * b.mass;
            if(a2bDistance < distanceMin)
                force /= distanceMin * distanceMin;
            else
                force *= oneOvera2bDistance * oneOvera2bDistance;
            a2bX *= force;
            a2bY *= force;
            a2bZ *= force;
            a.getForce().add(-a2bX, -a2bY, -a2bZ);
            b.getForce().add(a2bX, a2bY, a2bZ);
        }
    }

    this.getStrength=function()
    {
        return this.k;
    }

    this.isOn=function()
    {
        return on;
    }

    this.isOff=function()
    {
        return !on;
    }

    this.hasDead=function()
    {
        return a.isDead() || b.isDead();
    }

}
//----------------------Spring.js-----------------------//

//package traer.physics;


// Referenced classes of package traer.physics:
//            Force, Particle, Vector3D

function Spring(/*Particle*/ A, /*Particle*/ B, /*float*/ ks, /*float*/ d, /*float*/ r) //implements Force

{

	var springConstant = ks;
	var damping = d;
	var restLength = r;
	var a = A;
	var b = B;
	var on = true;

    this.turnOff=function()
    {
        on = false;
    }

    this.turnOn=function()
    {
        on = true;
    }

    this.isOn=function()
    {
        return on;
    }

    this.isOff=function()
    {
        return !on;
    }

    this.getOneEnd=function()
    {
        return a;
    }

    this.getTheOtherEnd=function()
    {
        return b;
    }

    this.currentLength=function()
    {
        return a.getPosition().distanceTo(b.getPosition());
    }

    this.restLength=function()
    {
        return restLength;
    }

    this.strength=function()
    {
        return springConstant;
    }

    this.setStrength=function(ks)
    {
        springConstant = ks;
    }

    this.damping=function()
    {
        return damping;
    }

    this.setDamping=function(d)
    {
        damping = d;
    }

    this.setRestLength=function(l)
    {
        restLength = l;
    }

    this.apply=function()
    {
        if(on)
        {
            var a2bX = a.getPosition().x - b.getPosition().x;
            var a2bY = a.getPosition().y - b.getPosition().y;
            var a2bZ = a.getPosition().z - b.getPosition().z;
            var oneOvera2bDistance = fastInverseSqrt(a2bX * a2bX + a2bY * a2bY + a2bZ * a2bZ);
            var a2bDistance = 1.0 / oneOvera2bDistance;
            if(a2bDistance == 0.0)
            {
                a2bX = 0.0;
                a2bY = 0.0;
                a2bZ = 0.0;
            } else
            {
                a2bX *= oneOvera2bDistance;
                a2bY *= oneOvera2bDistance;
                a2bZ *= oneOvera2bDistance;
            }
            var springForce = -(a2bDistance - restLength) * springConstant;
            var Va2bX = a.getVelocity().x - b.getVelocity().x;
            var Va2bY = a.getVelocity().y - b.getVelocity().y;
            var Va2bZ = a.getVelocity().z - b.getVelocity().z;
            var dampingForce = -damping * (a2bX * Va2bX + a2bY * Va2bY + a2bZ * Va2bZ);
            var r = springForce + dampingForce;
            a2bX *= r;
            a2bY *= r;
            a2bZ *= r;
            if(a.isFree())
                a.getForce().add(a2bX, a2bY, a2bZ);
            if(b.isFree())
                b.getForce().add(-a2bX, -a2bY, -a2bZ);
        }
    }

    this.hasDead=function()
    {
        return a.isDead() || b.isDead();
    }

}
//----------------------ParticleSystem.js-----------------------//

//package traer.physics;

//import java.util.ArrayList;
//import java.util.Iterator;

// Referenced classes of package traer.physics:
//            Vector3D, RungeKuttaIntegrator, Particle, Spring, 
//            Attraction

function ParticleSystem() ///*float*/ gx, /*float*/ gy, /*float*/ gz, /*float*/ somedrag
{
	
	if(arguments.length==2) {
		var _gx = 0;
		var _gy = arguments[0];
		var _gz = 0;
    	this.drag = arguments[1]; //float				
	} else if(arguments.length==4) {
		var _gx = arguments[0];
		var _gy = arguments[1];
		var _gz = arguments[2];
    	this.drag = arguments[3]; //float		
	} else {
		LilyDebugWindow.error("Incorrect arguments");
		return;
	}
	
    this.particles = new ArrayList();	
    this.springs = new ArrayList();
    this.attractions = new ArrayList();
    this.gravity = new Vector3D(_gx, _gy, _gz);
    this.integrator = new RungeKuttaIntegrator(this);	

    this.setGravity=function()
    {
		if(arguments.length==3)
        	this.gravity.set(arguments[0], arguments[1], arguments[2]);
		else if(arguments.length==1)
			this.gravity.set(0, arguments[0], 0);
    }

    this.setDrag=function(d)
    {
        this.drag = d;
    }

    this.advanceTime=function(time)
    {
        this.cleanUp();
        this.integrator.step(time);
    }

    this.tick=function(t)
    {
        var time = t||1.0;
		this.cleanUp();
        this.integrator.step(time);
    }

    this.makeParticle=function(mass, x, y, z)
    {
		var _mass = mass||1.0;
		var _x = x||0;
		var _y = y||0;
		var _z = z||0

        var p = new Particle(_mass, new Vector3D(_x, _y, _z));

        this.particles.add(p);
        this.integrator.allocateParticles();
        return p;
    }

    this.makeSpring=function(a, b, ks, d, r)
    {
        var s = new Spring(a, b, ks, d, r);
        this.springs.add(s);
        return s;
    }

    this.makeAttraction=function(a, b, k, minDistance)
    {
        var m = new Attraction(a, b, k, minDistance);
        this.attractions.add(m);
        return m;
    }

    this.clear=function()
    {
        this.particles.clear();
        this.springs.clear();
        this.attractions.clear();
    }

    this.applyForces=function()
    {
        for(var i = 0; i < this.particles.size(); i++)
        {
            var p = this.particles.get(i);
            p.force.add(this.gravity);
            p.force.add(p.velocity.x * -this.drag, p.velocity.y * -this.drag, p.velocity.z * -this.drag);
        }

        for(var i = 0; i < this.springs.size(); i++)
        {
            var f = this.springs.get(i);
            f.apply();
        }

        for(var i = 0; i < this.attractions.size(); i++)
        {
            var f = this.attractions.get(i);
            f.apply();
        }

    }

    this.clearForces=function()
    {
        for(var i = 0; i < this.particles.size(); i++)
        {
            var p = this.particles.get(i);
            p.force.clear();
		}

    }

    this.cleanUp=function()
    {
        for(var i = this.particles.size() - 1; i >= 0; i--)
        {
            var p = this.particles.get(i);
            if(p.isDead())
                this.particles.remove(i);
        }

        for(var i = this.springs.size() - 1; i >= 0; i--)
        {
            var f = this.springs.get(i);
            if(f.hasDead())
                this.springs.remove(i);
        }

        for(var i = this.attractions.size() - 1; i >= 0; i--)
        {
            var f = this.attractions.get(i);
            if(f.hasDead())
                this.attractions.remove(i);
        }

    }

    this.numberOfParticles=function()
    {
        return this.particles.size();
    }

    this.numberOfSprings=function()
    {
        return this.springs.size();
    }

    this.numberOfAttractions=function()
    {
        return this.attractions.size();
    }

    this.getParticle=function(i)
    {
        return this.particles.get(i);
    }

    this.getSpring=function(i)
    {
        return this.springs.get(i);
    }

    this.getAttraction=function(i)
    {
        return this.attractions.get(i);
    }

}
//----------------------RungeKuttaIntegrator.js-----------------------//


//package traer.physics;

//import java.util.ArrayList;

// Referenced classes of package traer.physics:
//            Vector3D, ParticleSystem, Particle

function RungeKuttaIntegrator(/*ParticleSystem*/ s)
{
	this.s 						= s;
	var originalPositions 		= new ArrayList();
	var originalVelocities 		= new ArrayList();
	var k1Forces 				= new ArrayList();
	var k1Velocities 			= new ArrayList();
	var k2Forces 				= new ArrayList();
	var k2Velocities 			= new ArrayList();
	var k3Forces 				= new ArrayList();
	var k3Velocities 			= new ArrayList();
	var k4Forces 				= new ArrayList();
	var k4Velocities 			= new ArrayList();

    this.allocateParticles=function()
    {
        for(; this.s.particles.size() > originalPositions.size(); k4Velocities.add(new Vector3D()))
        {
            originalPositions.add(new Vector3D());
            originalVelocities.add(new Vector3D());
            k1Forces.add(new Vector3D());
            k1Velocities.add(new Vector3D());
            k2Forces.add(new Vector3D());
            k2Velocities.add(new Vector3D());
            k3Forces.add(new Vector3D());
            k3Velocities.add(new Vector3D());
            k4Forces.add(new Vector3D());
        }

    }

    this.step=function(deltaT)
    {
        for(var i = 0; i < this.s.particles.size(); i++)
        {
            var p = this.s.particles.get(i);
            if(p.isFree())
            {
                (originalPositions.get(i)).set(p.position);
                (originalVelocities.get(i)).set(p.velocity);
            }
            p.force.clear();
        }

        s.applyForces();
        for(var i = 0; i < this.s.particles.size(); i++)
        {
            var p = this.s.particles.get(i);
            if(p.isFree())
            {
                (k1Forces.get(i)).set(p.force);
                (k1Velocities.get(i)).set(p.velocity);
            }
            p.force.clear();
        }

        for(var i = 0; i < this.s.particles.size(); i++)
        {
            var p = this.s.particles.get(i);
            if(p.isFree())
            {
                var originalPosition = originalPositions.get(i);
                var k1Velocity = k1Velocities.get(i);
                p.position.x = originalPosition.x + k1Velocity.x * 0.5 * deltaT;
                p.position.y = originalPosition.y + k1Velocity.y * 0.5 * deltaT;
                p.position.z = originalPosition.z + k1Velocity.z * 0.5 * deltaT;
                var originalVelocity = originalVelocities.get(i);
                var k1Force = k1Forces.get(i);
                p.velocity.x = originalVelocity.x + (k1Force.x * 0.5 * deltaT) / p.mass;
                p.velocity.y = originalVelocity.y + (k1Force.y * 0.5 * deltaT) / p.mass;
                p.velocity.z = originalVelocity.z + (k1Force.z * 0.5 * deltaT) / p.mass;
            }
        }

        s.applyForces();
        for(var i = 0; i < this.s.particles.size(); i++)
        {
            var p = this.s.particles.get(i);
            if(p.isFree())
            {
                (k2Forces.get(i)).set(p.force);
                (k2Velocities.get(i)).set(p.velocity);
            }
            p.force.clear();
        }

        for(var i = 0; i < this.s.particles.size(); i++)
        {
            var p = this.s.particles.get(i);
            if(p.isFree())
            {
                var originalPosition = originalPositions.get(i);
                var k2Velocity = k2Velocities.get(i);
                p.position.x = originalPosition.x + k2Velocity.x * 0.5 * deltaT;
                p.position.y = originalPosition.y + k2Velocity.y * 0.5 * deltaT;
                p.position.z = originalPosition.z + k2Velocity.z * 0.5 * deltaT;
                var originalVelocity = originalVelocities.get(i);
                var k2Force = k2Forces.get(i);
                p.velocity.x = originalVelocity.x + (k2Force.x * 0.5 * deltaT) / p.mass;
                p.velocity.y = originalVelocity.y + (k2Force.y * 0.5 * deltaT) / p.mass;
                p.velocity.z = originalVelocity.z + (k2Force.z * 0.5 * deltaT) / p.mass;
            }
        }

        s.applyForces();
        for(var i = 0; i < this.s.particles.size(); i++)
        {
            var p = this.s.particles.get(i);
            if(p.isFree())
            {
                (k3Forces.get(i)).set(p.force);
                (k3Velocities.get(i)).set(p.velocity);
            }
            p.force.clear();
        }

        for(var i = 0; i < this.s.particles.size(); i++)
        {
            var p = this.s.particles.get(i);
            if(p.isFree())
            {
                var originalPosition = originalPositions.get(i);
                var k3Velocity = k3Velocities.get(i);
                p.position.x = originalPosition.x + k3Velocity.x * deltaT;
                p.position.y = originalPosition.y + k3Velocity.y * deltaT;
                p.position.z = originalPosition.z + k3Velocity.z * deltaT;
                var originalVelocity = originalVelocities.get(i);
                var k3Force = k3Forces.get(i);
                p.velocity.x = originalVelocity.x + (k3Force.x * deltaT) / p.mass;
                p.velocity.y = originalVelocity.y + (k3Force.y * deltaT) / p.mass;
                p.velocity.z = originalVelocity.z + (k3Force.z * deltaT) / p.mass;
            }
        }

        s.applyForces();
        for(var i = 0; i < this.s.particles.size(); i++)
        {
            var p = this.s.particles.get(i);
            if(p.isFree())
            {
                (k4Forces.get(i)).set(p.force);
                (k4Velocities.get(i)).set(p.velocity);
            }
        }

        for(var i = 0; i < this.s.particles.size(); i++)
        {
            var p = this.s.particles.get(i);
            p.age += deltaT;
            if(p.isFree())
            {
                var originalPosition = originalPositions.get(i);
                var k1Velocity = k1Velocities.get(i);
                var k2Velocity = k2Velocities.get(i);
                var k3Velocity = k3Velocities.get(i);
                var k4Velocity = k4Velocities.get(i);
                p.position.x = originalPosition.x + (deltaT / 6.0) * (k1Velocity.x + 2.0 * k2Velocity.x + 2.0 * k3Velocity.x + k4Velocity.x);
                p.position.y = originalPosition.y + (deltaT / 6.0) * (k1Velocity.y + 2.0 * k2Velocity.y + 2.0 * k3Velocity.y + k4Velocity.y);
                p.position.z = originalPosition.z + (deltaT / 6.0) * (k1Velocity.z + 2.0 * k2Velocity.z + 2.0 * k3Velocity.z + k4Velocity.z);
                var originalVelocity = originalVelocities.get(i);
                var k1Force = k1Forces.get(i);
                var k2Force = k2Forces.get(i);
                var k3Force = k3Forces.get(i);
                var k4Force = k4Forces.get(i);
                p.velocity.x = originalVelocity.x + (deltaT / (6.0 * p.mass)) * (k1Force.x + 2.0 * k2Force.x + 2.0 * k3Force.x + k4Force.x);
                p.velocity.y = originalVelocity.y + (deltaT / (6.0 * p.mass)) * (k1Force.y + 2.0 * k2Force.y + 2.0 * k3Force.y + k4Force.y);
                p.velocity.z = originalVelocity.z + (deltaT / (6.0 * p.mass)) * (k1Force.z + 2.0 * k2Force.z + 2.0 * k3Force.z + k4Force.z);
            }
        }

    }

}

/* END PHYSICS */

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* START ANIMATION */

/*
	javascript port of traer physics - http://www.cs.princeton.edu/~traer/physics/
*/

function Smoother() //    implements Tickable
{
	
    this.a = 0;
    this.gain = 0;
    this.lastOutput = 0;
    this.input = 0;

    this.setSmoothness=function(smoothness)
    {
        this.a = -smoothness;
        this.gain = 1.0 + this.a;
    }

    this.setTarget=function(target)
    {
        this.input = target;
    }

    this.setValue=function(x)
    {
        this.input = x;
        this.lastOutput = x;
    }

    this.getTarget=function()
    {
        return input;
    }

    this.tick=function()
    {
        this.lastOutput = this.gain * this.input - this.a * this.lastOutput;
    }

    this.getValue=function()
    {
        return this.lastOutput;
    }

    if(arguments.length==1) {
        this.setSmoothness(arguments[0]);
        this.setValue(0.0);
     } else if(arguments.length==2) {
        this.setSmoothness(arguments[0]);
        this.setValue(arguments[1]);
     }
}
//package traer.animation;


// Referenced classes of package traer.animation:
//            Tickable, Smoother

function Smoother2D() //    implements Tickable
{
	
    this.x = null;
    this.y = null;	
	
    if(arguments.length==1) {
        this.x = new Smoother(arguments[0]);
        this.y = new Smoother(arguments[0]);
    } else if(arguments.length==3) {
        this.x = new Smoother(arguments[2], arguments[0]);
        this.y = new Smoother(arguments[2], arguments[1]);
    }

    this.setTarget=function(X, Y)
    {
        this.x.setTarget(X);
        this.y.setTarget(Y);
    }

    this.setValue=function(X, Y)
    {
        this.x.setValue(X);
        this.y.setValue(Y);
    }

    this.setX=function(X)
    {
        this.x.setValue(X);
    }

    this.setY=function(Y)
    {
        this.y.setValue(Y);
    }

    this.setXTarget=function(X)
    {
        this.x.setTarget(X);
    }

    this.setYTarget=function(X)
    {
        this.y.setTarget(X);
    }

    this.getXTarget=function()
    {
        return this.x.getTarget();
    }

    this.getYTarget=function()
    {
        return this.y.getTarget();
    }

    this.setSmoothness=function(smoothness)
    {
        this.x.setSmoothness(smoothness);
        this.y.setSmoothness(smoothness);
    }

    this.tick=function()
    {
        this.x.tick();
        this.y.tick();
    }

    //changed from x()
    this.getX=function()
    {
        return this.x.getValue();
    }

    //changed from y()
    this.getY=function()
    {
        return this.y.getValue();
    }

}
//package traer.animation;


// Referenced classes of package traer.animation:
//            Tickable, Smoother

function Smoother3D() //    implements Tickable
{

    this.x = null;
    this.y = null;
    this.z = null;

    if(arguments.length==1) {
        this.x = new Smoother(arguments[0]);
        this.y = new Smoother(arguments[0]);
        this.z = new Smoother(arguments[0]);
    } else if(arguments.length==4) {
        this.x = new Smoother(arguments[3], arguments[0]);
        this.y = new Smoother(arguments[3], arguments[1]);
        this.z = new Smoother(arguments[3], arguments[2]);
    }	

    this.setXTarget=function(X)
    {
        this.x.setTarget(X);
    }

    this.setYTarget=function(X)
    {
        this.y.setTarget(X);
    }

    this.setZTarget=function(X)
    {
        this.z.setTarget(X);
    }

    this.getXTarget=function()
    {
        return this.x.getTarget();
    }

    this.getYTarget=function()
    {
        return this.y.getTarget();
    }

    this.getZTarget=function()
    {
        return this.z.getTarget();
    }

    this.setTarget=function(X, Y, Z)
    {
        this.x.setTarget(X);
        this.y.setTarget(Y);
        this.z.setTarget(Z);
    }

    this.setValue=function(X, Y, Z)
    {
        this.x.setValue(X);
        this.y.setValue(Y);
        this.z.setValue(Z);
    }

    this.setX=function(X)
    {
        this.x.setValue(X);
    }

    this.setY=function(Y)
    {
        this.y.setValue(Y);
    }

    this.setZ=function(Z)
    {
        this.z.setValue(Z);
    }

    this.setSmoothness=function(smoothness)
    {
        this.x.setSmoothness(smoothness);
        this.y.setSmoothness(smoothness);
        this.z.setSmoothness(smoothness);
    }

    this.tick=function()
    {
        this.x.tick();
        this.y.tick();
        this.z.tick();
    }

    //changed from x()
    this.getX=function()
    {
        return this.x.getValue();
    }

    //changed from y()
    this.getY=function()
    {
        return this.y.getValue();
    }

    //changed from z()
    this.getZ=function()
    {
        return this.z.getValue();
    }
}
//package traer.animation;

//import java.util.Vector;

// Referenced classes of package traer.animation:
//            Tickable, Smoother, Smoother2D, Smoother3D

function Animator(_smoothness) //    implements Tickable
{
	
    this.smoothers = new ArrayList();
    this.smoothness = _smoothness||0;	

    this.makeSmoother=function()
    {
        var s = new Smoother(this.smoothness);
        this.smoothers.add(s);
        return s;
    }

    this.make2DSmoother=function()
    {
        var s = new Smoother2D(this.smoothness);
        this.smoothers.add(s);
        return s;
    }

    this.make3DSmoother=function()
    {
        var s = new Smoother3D(this.smoothness);
        this.smoothers.add(s);
        return s;
    }

    this.tick=function()
    {
        for(var i = 0; i < this.smoothers.size(); i++)
        {
            var t = this.smoothers.get(i);
            t.tick();
        }

    }

    this.setSmoothness=function(smoothness)
    {
        for(var i = 0; i < this.smoothers.size(); i++)
        {
            var t = this.smoothers.get(i);
            t.setSmoothness(this.smoothness);
        }

    }
}


/* END ANIMATION */